<?php

namespace wcf\system\package\validation;

use wcf\data\package\Package;
use wcf\data\package\PackageList;
use wcf\system\application\ApplicationHandler;
use wcf\system\database\util\PreparedStatementConditionBuilder;
use wcf\system\package\PackageArchive;
use wcf\system\WCF;

/**
 * Recursively validates the package archive and it's delivered requirements.
 *
 * @author  Alexander Ebert
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\System\Package\Validation
 */
class PackageValidationArchive implements \RecursiveIterator
{
    /**
     * list of excluded packages grouped by package
     * @var string[][][]
     */
    protected static $excludedPackages = [];

    /**
     * package archive object
     * @var PackageArchive
     */
    protected $archive;

    /**
     * list of direct requirements delivered by this package
     * @var PackageValidationArchive[]
     */
    protected $children = [];

    /**
     * nesting depth
     * @var int
     */
    protected $depth = 0;

    /**
     * exception occurred during validation
     * @var \Exception
     */
    protected $exception;

    /**
     * associated package object
     * @var Package
     */
    protected $package;

    /**
     * parent package validation archive object
     * @var PackageValidationArchive
     */
    protected $parent;

    /**
     * children pointer
     * @var int
     */
    private $position = 0;

    /**
     * Creates a new package validation archive instance.
     *
     * @param string $archive
     * @param PackageValidationArchive $parent
     * @param int $depth
     */
    public function __construct($archive, ?self $parent = null, $depth = 0)
    {
        $this->archive = new PackageArchive($archive);
        $this->parent = $parent;
        $this->depth = $depth;
    }

    /**
     * Validates this package and optionally it's delivered requirements. The set validation
     * mode will toggle between different checks.
     *
     * @param int $validationMode
     * @param string $requiredVersion
     * @return  bool
     */
    public function validate($validationMode, $requiredVersion = '')
    {
        if ($validationMode !== PackageValidationManager::VALIDATION_EXCLUSION) {
            try {
                // try to read archive
                $this->archive->openArchive();

                $this->validateApplication();

                // check if package is installable or suitable for an update
                $this->validateInstructions($requiredVersion, $validationMode);
            } catch (PackageValidationException $e) {
                $this->exception = $e;

                return false;
            }
        }

        $package = $this->archive->getPackageInfo('name');

        if ($validationMode === PackageValidationManager::VALIDATION_RECURSIVE) {
            try {
                PackageValidationManager::getInstance()->addVirtualPackage(
                    $package,
                    $this->archive->getPackageInfo('version')
                );

                // cache excluded packages
                self::$excludedPackages[$package] = [];
                $excludedPackages = $this->archive->getExcludedPackages();
                for ($i = 0, $count = \count($excludedPackages); $i < $count; $i++) {
                    if (!isset(self::$excludedPackages[$package][$excludedPackages[$i]['name']])) {
                        self::$excludedPackages[$package][$excludedPackages[$i]['name']] = [];
                    }

                    self::$excludedPackages[$package][$excludedPackages[$i]['name']][] = $excludedPackages[$i]['version'];
                }

                // traverse open requirements
                foreach ($this->archive->getOpenRequirements() as $requirement) {
                    $virtualPackageVersion = PackageValidationManager::getInstance()
                        ->getVirtualPackage($requirement['name']);
                    if (
                        $virtualPackageVersion === null
                        || Package::compareVersion($virtualPackageVersion, $requirement['minversion'], '<')
                    ) {
                        if (empty($requirement['file'])) {
                            // check if package is known
                            $sql = "SELECT  *
                                    FROM    wcf" . WCF_N . "_package
                                    WHERE   package = ?";
                            $statement = WCF::getDB()->prepareStatement($sql);
                            $statement->execute([$requirement['name']]);
                            $package = $statement->fetchObject(Package::class);

                            throw new PackageValidationException(PackageValidationException::MISSING_REQUIREMENT, [
                                'package' => $package,
                                'packageName' => $requirement['name'],
                                'packageVersion' => $requirement['minversion'],
                            ]);
                        }

                        $archive = $this->archive->extractTar($requirement['file']);

                        $index = \count($this->children);
                        $this->children[$index] = new self($archive, $this, $this->depth + 1);
                        if (
                            !$this->children[$index]->validate(
                                PackageValidationManager::VALIDATION_RECURSIVE,
                                $requirement['minversion']
                            )
                        ) {
                            return false;
                        }

                        PackageValidationManager::getInstance()->addVirtualPackage(
                            $this->children[$index]->getArchive()->getPackageInfo('name'),
                            $this->children[$index]->getArchive()->getPackageInfo('version')
                        );
                    }
                }
            } catch (PackageValidationException $e) {
                $this->exception = $e;

                return false;
            }
        } elseif ($validationMode === PackageValidationManager::VALIDATION_EXCLUSION) {
            try {
                $this->validateExclusion($package);

                for ($i = 0, $count = \count($this->children); $i < $count; $i++) {
                    if (!$this->children[$i]->validate(PackageValidationManager::VALIDATION_EXCLUSION)) {
                        return false;
                    }
                }
            } catch (PackageValidationException $e) {
                $this->exception = $e;

                return false;
            }
        }

        return true;
    }

    /**
     * Validates if the package, if it is an app, can be installed.
     *
     * @throws  PackageValidationException
     * @since   5.4
     */
    protected function validateApplication(): void
    {
        if ($this->archive->getPackageInfo('isApplication')) {
            $identifier = $this->archive->getPackageInfo('name');
            $abbreviation = Package::getAbbreviation($identifier);

            $application = ApplicationHandler::getInstance()->getApplication($abbreviation);
            if ($application !== null && $application->getPackage()->package !== $identifier) {
                throw new PackageValidationException(PackageValidationException::DUPLICATE_ABBREVIATION, [
                    'packageName' => $this->archive->getPackageInfo('name'),
                    'application' => $application,
                ]);
            }
        }
    }

    /**
     * Validates if the package has suitable install or update instructions
     *
     * @param string $requiredVersion
     * @param int $validationMode
     * @throws  PackageValidationException
     */
    protected function validateInstructions($requiredVersion, $validationMode)
    {
        $package = $this->getPackage();

        // delivered package does not provide the minimum required version
        if (Package::compareVersion($requiredVersion, $this->archive->getPackageInfo('version'), '>')) {
            throw new PackageValidationException(PackageValidationException::INSUFFICIENT_VERSION, [
                'packageName' => $this->archive->getPackageInfo('name'),
                'packageVersion' => $requiredVersion,
                'deliveredPackageVersion' => $this->archive->getPackageInfo('version'),
            ]);
        }

        // check if this package exposes compatible api versions
        $compatibleVersions = $this->archive->getCompatibleVersions();
        if (!empty($compatibleVersions)) {
            $isCompatible = $isOlderVersion = false;
            foreach ($compatibleVersions as $version) {
                if (WCF::isSupportedApiVersion($version)) {
                    $isCompatible = true;
                    break;
                } elseif ($version < WSC_API_VERSION) {
                    $isOlderVersion = true;
                }
            }

            if (!$isCompatible) {
                throw new PackageValidationException(
                    PackageValidationException::INCOMPATIBLE_API_VERSION,
                    ['isOlderVersion' => $isOlderVersion]
                );
            }
        }
        // Missing details on API compatibility are no longer an error.

        // package is not installed yet
        if ($package === null) {
            $instructions = $this->archive->getInstallInstructions();
            if (empty($instructions)) {
                throw new PackageValidationException(
                    PackageValidationException::NO_INSTALL_PATH,
                    ['packageName' => $this->archive->getPackageInfo('name')]
                );
            }

            if ($validationMode == PackageValidationManager::VALIDATION_RECURSIVE) {
                $this->validatePackageInstallationPlugins('install', $instructions);
            }
        } else {
            // package is already installed, check update path
            if (!$this->archive->isValidUpdate($package)) {
                $deliveredPackageVersion = $this->archive->getPackageInfo('version');

                // check if the package is already installed with the same exact version
                if ($package->packageVersion === $deliveredPackageVersion) {
                    throw new PackageValidationException(PackageValidationException::ALREADY_INSTALLED, [
                        'packageName' => $package->packageName,
                        'packageVersion' => $package->packageVersion,
                    ]);
                } else {
                    throw new PackageValidationException(PackageValidationException::NO_UPDATE_PATH, [
                        'packageName' => $package->packageName,
                        'packageVersion' => $package->packageVersion,
                        'deliveredPackageVersion' => $deliveredPackageVersion,
                    ]);
                }
            }

            if ($validationMode === PackageValidationManager::VALIDATION_RECURSIVE) {
                $this->validatePackageInstallationPlugins('update', $this->archive->getUpdateInstructions());
            }
        }
    }

    /**
     * Validates install or update instructions against the corresponding PIP, unknown PIPs will be silently ignored.
     *
     * @param string $type
     * @param mixed[][] $instructions
     * @throws  PackageValidationException
     */
    protected function validatePackageInstallationPlugins($type, array $instructions)
    {
        for ($i = 0, $length = \count($instructions); $i < $length; $i++) {
            $instruction = $instructions[$i];
            if (
                !PackageValidationManager::getInstance()->validatePackageInstallationPluginInstruction(
                    $this->archive,
                    $instruction['pip'],
                    $instruction['value']
                )
            ) {
                $defaultFilename = PackageValidationManager::getInstance()
                    ->getDefaultFilenameForPackageInstallationPlugin($instruction['pip']);

                throw new PackageValidationException(PackageValidationException::MISSING_INSTRUCTION_FILE, [
                    'pip' => $instruction['pip'],
                    'type' => $type,
                    'value' => $instruction['value'] ?: $defaultFilename,
                ]);
            }
        }
    }

    /**
     * Validates if an installed package excludes the current package and vice versa.
     *
     * @param string $package
     * @throws  PackageValidationException
     */
    protected function validateExclusion($package)
    {
        $packageVersion = $this->archive->getPackageInfo('version');

        // excluding packages: installed -> current
        $sql = "SELECT      package.*, package_exclusion.*
                FROM        wcf" . WCF_N . "_package_exclusion package_exclusion
                LEFT JOIN   wcf" . WCF_N . "_package package
                ON          package.packageID = package_exclusion.packageID
                WHERE       excludedPackage = ?";
        $statement = WCF::getDB()->prepareStatement($sql);
        $statement->execute([$this->getArchive()->getPackageInfo('name')]);
        $excludingPackages = [];
        while ($row = $statement->fetchArray()) {
            $excludingPackage = $row['package'];

            // use exclusions of queued package
            if (isset(self::$excludedPackages[$excludingPackage])) {
                if (isset(self::$excludedPackages[$excludingPackage][$package])) {
                    for ($i = 0, $count = \count(self::$excludedPackages[$excludingPackage][$package]); $i < $count; $i++) {
                        if (
                            self::$excludedPackages[$excludingPackage][$package][$i] === '*'
                            || Package::compareVersion(
                                $packageVersion,
                                self::$excludedPackages[$excludingPackage][$package][$i],
                                '>='
                            )
                        ) {
                            $excludingPackages[] = new Package(null, $row);
                        }
                    }

                    continue;
                }
            } else {
                if (
                    $row['excludedPackageVersion'] === '*'
                    || Package::compareVersion($packageVersion, $row['excludedPackageVersion'], '>=')
                ) {
                    $excludingPackages[] = new Package(null, $row);
                }
            }
        }

        if (!empty($excludingPackages)) {
            throw new PackageValidationException(
                PackageValidationException::EXCLUDING_PACKAGES,
                ['packages' => $excludingPackages]
            );
        }

        // excluded packages: current -> installed
        if (!empty(self::$excludedPackages[$package])) {
            // get installed packages
            $conditions = new PreparedStatementConditionBuilder();
            $conditions->add("package IN (?)", [\array_keys(self::$excludedPackages[$package])]);
            $sql = "SELECT  *
                    FROM    wcf" . WCF_N . "_package
                    " . $conditions;
            $statement = WCF::getDB()->prepareStatement($sql);
            $statement->execute($conditions->getParameters());
            $packages = [];
            while ($row = $statement->fetchArray()) {
                $packages[$row['package']] = new Package(null, $row);
            }

            $excludedPackages = [];
            foreach ($packages as $excludedPackage => $packageObj) {
                $version = PackageValidationManager::getInstance()->getVirtualPackage($excludedPackage);
                if ($version === null) {
                    $version = $packageObj->packageVersion;
                }

                for ($i = 0, $count = \count(self::$excludedPackages[$package][$excludedPackage]); $i < $count; $i++) {
                    if (
                        self::$excludedPackages[$package][$excludedPackage][$i] !== "*"
                        && Package::compareVersion(
                            $version,
                            self::$excludedPackages[$package][$excludedPackage][$i],
                            '<'
                        )
                    ) {
                        continue;
                    }

                    $excludedPackages[] = $packageObj;
                }
            }

            if (!empty($excludedPackages)) {
                throw new PackageValidationException(
                    PackageValidationException::EXCLUDED_PACKAGES,
                    ['packages' => $excludedPackages]
                );
            }
        }
    }

    /**
     * Returns the occurred exception.
     *
     * @return  \Exception
     */
    public function getException()
    {
        return $this->exception;
    }

    /**
     * Returns the exception message.
     *
     * @return  string
     */
    public function getExceptionMessage()
    {
        if ($this->exception === null) {
            return '';
        }

        if ($this->exception instanceof PackageValidationException) {
            return $this->exception->getErrorMessage();
        }

        return $this->exception->getMessage();
    }

    /**
     * Returns the package archive object.
     *
     * @return  PackageArchive
     */
    public function getArchive()
    {
        return $this->archive;
    }

    /**
     * Returns the package object based on the package archive's package identifier or null
     * if the package isn't already installed.
     *
     * @return  Package
     */
    public function getPackage()
    {
        if ($this->package === null) {
            static $packages;
            if ($packages === null) {
                $packages = [];

                // Do not rely on PackageCache here, it may be outdated if a previous installation of a package has failed
                // and the user attempts to install it again in a secondary browser tab!
                $packageList = new PackageList();
                $packageList->readObjects();
                foreach ($packageList as $package) {
                    $packages[$package->package] = $package;
                }
            }

            $identifier = $this->archive->getPackageInfo('name');
            if (isset($packages[$identifier])) {
                $this->package = $packages[$identifier];
            }
        }

        return $this->package;
    }

    /**
     * Returns nesting depth.
     *
     * @return  int
     */
    public function getDepth()
    {
        return $this->depth;
    }

    /**
     * Sets the children of this package validation archive.
     *
     * @param PackageValidationArchive[] $children
     */
    public function setChildren(array $children)
    {
        $this->children = $children;
    }

    /**
     * @inheritDoc
     */
    public function rewind()
    {
        $this->position = 0;
    }

    /**
     * @inheritDoc
     */
    public function valid()
    {
        return isset($this->children[$this->position]);
    }

    /**
     * @inheritDoc
     */
    public function next()
    {
        $this->position++;
    }

    /**
     * @inheritDoc
     */
    public function current()
    {
        return $this->children[$this->position];
    }

    /**
     * @inheritDoc
     */
    public function key()
    {
        return $this->position;
    }

    /**
     * @inheritDoc
     */
    public function getChildren()
    {
        return $this->children[$this->position];
    }

    /**
     * @inheritDoc
     */
    public function hasChildren()
    {
        return \count($this->children) > 0;
    }
}
