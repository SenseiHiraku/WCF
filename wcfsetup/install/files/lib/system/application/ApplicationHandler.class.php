<?php

namespace wcf\system\application;

use wcf\data\application\Application;
use wcf\data\application\ApplicationAction;
use wcf\data\application\ApplicationList;
use wcf\data\package\Package;
use wcf\data\package\PackageList;
use wcf\system\cache\builder\ApplicationCacheBuilder;
use wcf\system\request\RequestHandler;
use wcf\system\request\RouteHandler;
use wcf\system\SingletonFactory;
use wcf\util\ArrayUtil;
use wcf\util\FileUtil;
use wcf\util\StringUtil;
use wcf\util\Url;

/**
 * Handles multi-application environments.
 *
 * @author  Alexander Ebert
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\System\Application
 */
class ApplicationHandler extends SingletonFactory
{
    /**
     * application cache
     * @var mixed[][]
     */
    protected $cache;

    /**
     * list of page URLs
     * @var string[]
     */
    protected $pageURLs = [];

    /**
     * Initializes cache.
     */
    protected function init()
    {
        $this->cache = ApplicationCacheBuilder::getInstance()->getData();
    }

    /**
     * Returns an application based upon it's abbreviation. Will return the
     * primary application if the abbreviation is `wcf` or `null` if no such
     * application exists.
     *
     * @param string $abbreviation package abbreviation, e.g. `wbb` for `com.woltlab.wbb`
     * @return  Application|null
     */
    public function getApplication($abbreviation)
    {
        if (isset($this->cache['abbreviation'][$abbreviation])) {
            $packageID = $this->cache['abbreviation'][$abbreviation];

            if (isset($this->cache['application'][$packageID])) {
                return $this->cache['application'][$packageID];
            }
        }

        return null;
    }

    /**
     * Returns an application delivered by the package with the given id or `null`
     * if no such application exists.
     *
     * @param int $packageID package id
     * @return  Application|null    application object
     * @since   3.0
     */
    public function getApplicationByID($packageID)
    {
        return $this->cache['application'][$packageID] ?? null;
    }

    /**
     * Returns pseudo-application representing WCF used for special cases,
     * e.g. cross-domain files requestable through the webserver.
     *
     * @return  Application
     */
    public function getWCF()
    {
        return $this->getApplicationByID(1);
    }

    /**
     * Returns the currently active application.
     *
     * @return  Application
     */
    public function getActiveApplication()
    {
        // work-around during WCFSetup
        if (!PACKAGE_ID) {
            $host = \str_replace(RouteHandler::getProtocol(), '', RouteHandler::getHost());
            $documentRoot = FileUtil::addTrailingSlash(FileUtil::unifyDirSeparator(\realpath($_SERVER['DOCUMENT_ROOT'])));

            // always use the core directory
            if (empty($_POST['directories']) || empty($_POST['directories']['wcf'])) {
                // within ACP
                $_POST['directories'] = ['wcf' => $documentRoot . FileUtil::removeLeadingSlash(RouteHandler::getPath(['acp']))];
            }

            $path = FileUtil::addLeadingSlash(FileUtil::addTrailingSlash(FileUtil::unifyDirSeparator(FileUtil::getRelativePath(
                $documentRoot,
                $_POST['directories']['wcf']
            ))));

            return new Application(null, [
                'domainName' => $host,
                'domainPath' => $path,
                'cookieDomain' => $host,
            ]);
        }

        $request = RequestHandler::getInstance()->getActiveRequest();
        if ($request !== null) {
            [$abbreviation] = \explode('\\', $request->getClassName(), 2);

            return $this->getApplication($abbreviation);
        }

        if (isset($this->cache['application'][PACKAGE_ID])) {
            return $this->cache['application'][PACKAGE_ID];
        }

        return $this->getWCF();
    }

    /**
     * Returns a list of dependent applications.
     *
     * @return  Application[]
     */
    public function getDependentApplications()
    {
        $applications = $this->getApplications();
        foreach ($applications as $key => $application) {
            if ($application->packageID == $this->getActiveApplication()->packageID) {
                unset($applications[$key]);
                break;
            }
        }

        return $applications;
    }

    /**
     * Returns a list of all active applications.
     *
     * @return  Application[]
     */
    public function getApplications()
    {
        return $this->cache['application'];
    }

    /**
     * Returns abbreviation for a given package id or `null` if application is unknown.
     *
     * @param int $packageID unique package id
     * @return  string|null
     */
    public function getAbbreviation($packageID)
    {
        foreach ($this->cache['abbreviation'] as $abbreviation => $applicationID) {
            if ($packageID == $applicationID) {
                return $abbreviation;
            }
        }

        return null;
    }

    /**
     * Returns the list of application abbreviations.
     *
     * @return      string[]
     * @since       3.1
     */
    public function getAbbreviations()
    {
        return \array_keys($this->cache['abbreviation']);
    }

    /**
     * Returns true if given $url is an internal URL.
     *
     * @param string $url
     * @return  bool
     */
    public function isInternalURL($url)
    {
        if (empty($this->pageURLs)) {
            $internalHostnames = ArrayUtil::trim(\explode("\n", StringUtil::unifyNewlines(\INTERNAL_HOSTNAMES)));

            $this->pageURLs = \array_unique([
                $this->getDomainName(),
                ...$internalHostnames,
            ]);
        }

        $host = Url::parse($url)['host'];

        // Relative URLs are internal.
        if (!$host) {
            return true;
        }

        return Url::getHostnameMatcher($this->pageURLs)($host);
    }

    /**
     * Always returns false.
     *
     * @return      bool
     * @since       3.1
     * @deprecated  5.4
     */
    public function isMultiDomainSetup()
    {
        return false;
    }

    /**
     * @since 5.2
     * @deprecated 5.5 - This function is a noop. The 'active' status is determined live.
     */
    public function rebuildActiveApplication()
    {
    }

    /**
     * @since 5.6
     */
    public function getDomainName(): string
    {
        return $this->getApplicationByID(1)->domainName;
    }

    /**
     * Rebuilds cookie domain/path for all applications.
     */
    public static function rebuild()
    {
        $applicationList = new ApplicationList();
        $applicationList->readObjects();

        $applicationAction = new ApplicationAction($applicationList->getObjects(), 'rebuild');
        $applicationAction->executeAction();
    }

    /**
     * Replaces `app1_` in the given string with the correct installation number:
     * `app{WCF_N_}`.
     *
     * This method can either be used for database table names directly or for
     * queries, for example.
     *
     * @param string $string string to be processed
     * @param bool $skipCache if `true`, no caches will be used and relevant application packages will be read from database directly
     * @return  string              processed string
     * @since   5.2
     */
    public static function insertRealDatabaseTableNames($string, $skipCache = false)
    {
        if ($skipCache) {
            $packageList = new PackageList();
            $packageList->getConditionBuilder()->add('package.isApplication = ?', [1]);
            $packageList->readObjects();

            foreach ($packageList as $package) {
                $abbreviation = Package::getAbbreviation($package->package);

                $string = \str_replace($abbreviation . '1_', $abbreviation . WCF_N . '_', $string);
            }
        } else {
            foreach (static::getInstance()->getAbbreviations() as $abbreviation) {
                $string = \str_replace($abbreviation . '1_', $abbreviation . WCF_N . '_', $string);
            }
        }

        return $string;
    }
}
