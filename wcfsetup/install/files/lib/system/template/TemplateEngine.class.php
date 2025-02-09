<?php

namespace wcf\system\template;

use Laminas\Diactoros\Stream;
use Psr\Http\Message\StreamInterface;
use wcf\data\template\Template;
use wcf\system\cache\builder\TemplateGroupCacheBuilder;
use wcf\system\cache\builder\TemplateListenerCodeCacheBuilder;
use wcf\system\event\EventHandler;
use wcf\system\exception\SystemException;
use wcf\system\Regex;
use wcf\system\SingletonFactory;
use wcf\util\DirectoryUtil;
use wcf\util\HeaderUtil;
use wcf\util\StringUtil;

/**
 * Loads and displays template.
 *
 * @author  Alexander Ebert
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\System\Template
 */
class TemplateEngine extends SingletonFactory
{
    /**
     * directory used to cache previously compiled templates
     * @var string
     */
    public $compileDir = '';

    /**
     * active language id used to identify specific language versions of compiled templates
     * @var int
     */
    public $languageID = 0;

    /**
     * directories used as template source
     * @var string[]
     */
    public $templatePaths = [];

    /**
     * namespace containing template modifiers and plugins
     * @var string
     */
    public $pluginNamespace = '';

    /**
     * active template compiler
     * @var TemplateCompiler
     */
    protected $compilerObj;

    /**
     * forces the template engine to recompile all included templates
     * @var bool
     */
    protected $forceCompile = false;

    /**
     * list of registered prefilters
     * @var string[]
     */
    protected $prefilters = [];

    /**
     * cached list of known template groups
     * @var array
     */
    protected $templateGroupCache = [];

    /**
     * active template group id
     * @var int
     */
    protected $templateGroupID = 0;

    /**
     * all available template variables and those assigned during runtime
     * @var mixed[][]
     */
    protected $v = [];

    /**
     * sandboxed values of currently active foreach loops' `item` and `key` variables
     *
     * for each currently active `foreach` loop, an array is added:
     *  $foreachHash => [
     *      (optional) 'item' => sandboxed value of an existing variable with the same name,
     *      (optional) 'key' => (optional) sandboxed value of an existing variable with the same name
     *  ]
     *
     * @var mixed[][][]
     */
    protected $foreachVars = [];

    /**
     * all cached variables for usage after execution in sandbox
     * @var mixed[][]
     */
    protected $sandboxVars = [];

    /**
     * contains all templates with assigned template listeners.
     * @var string[][][]
     */
    protected $templateListeners = [];

    /**
     * true, if template listener code was already loaded
     * @var bool
     */
    protected $templateListenersLoaded = false;

    /**
     * current environment
     * @var string
     */
    protected $environment = 'user';

    protected $pluginObjects = [];

    protected $tagStack = [];

    /**
     * @inheritDoc
     */
    protected function init()
    {
        $this->templatePaths = ['wcf' => WCF_DIR . 'templates/'];
        $this->pluginNamespace = 'wcf\system\template\plugin\\';
        $this->compileDir = WCF_DIR . 'templates/compiled/';

        $this->loadTemplateGroupCache();
        $this->assignSystemVariables();
    }

    /**
     * Adds a new application.
     *
     * @param string $abbreviation
     * @param string $templatePath
     */
    public function addApplication($abbreviation, $templatePath)
    {
        $this->templatePaths[$abbreviation] = $templatePath;
    }

    /**
     * Sets active language id.
     *
     * @param int $languageID
     */
    public function setLanguageID($languageID)
    {
        $this->languageID = $languageID;
    }

    /**
     * Assigns some system variables.
     */
    protected function assignSystemVariables()
    {
        $this->v['tpl'] = [];

        // assign super globals
        $this->v['tpl']['get'] = &$_GET;
        $this->v['tpl']['post'] = &$_POST;
        $this->v['tpl']['cookie'] = &$_COOKIE;
        $this->v['tpl']['server'] = &$_SERVER;
        $this->v['tpl']['env'] = &$_ENV;

        // system info
        $this->v['tpl']['now'] = TIME_NOW;
        $this->v['tpl']['template'] = '';
        $this->v['tpl']['includedTemplates'] = [];

        // section / foreach / capture arrays
        $this->v['tpl']['section'] = $this->v['tpl']['foreach'] = $this->v['tpl']['capture'] = [];
    }

    /**
     * Assigns a template variable.
     *
     * @param mixed $variable
     * @param mixed $value
     */
    public function assign($variable, $value = '')
    {
        if (\is_array($variable)) {
            foreach ($variable as $key => $value) {
                if (empty($key)) {
                    continue;
                }

                $this->assign($key, $value);
            }
        } else {
            $this->v[$variable] = $value;
        }
    }

    /**
     * Appends content to an existing template variable.
     *
     * @param mixed $variable
     * @param mixed $value
     */
    public function append($variable, $value = '')
    {
        if (\is_array($variable)) {
            foreach ($variable as $key => $val) {
                if ($key != '') {
                    $this->append($key, $val);
                }
            }
        } else {
            if (!empty($variable)) {
                if (isset($this->v[$variable])) {
                    if (\is_array($this->v[$variable]) && \is_array($value)) {
                        $keys = \array_keys($value);
                        foreach ($keys as $key) {
                            if (isset($this->v[$variable][$key])) {
                                $this->v[$variable][$key] .= $value[$key];
                            } else {
                                $this->v[$variable][$key] = $value[$key];
                            }
                        }
                    } else {
                        $this->v[$variable] .= $value;
                    }
                } else {
                    $this->v[$variable] = $value;
                }
            }
        }
    }

    /**
     * Prepends content to an existing template variable.
     *
     * @param mixed $variable
     * @param mixed $value
     */
    public function prepend($variable, $value = '')
    {
        if (\is_array($variable)) {
            foreach ($variable as $key => $val) {
                if ($key != '') {
                    $this->prepend($key, $val);
                }
            }
        } else {
            if (!empty($variable)) {
                if (isset($this->v[$variable])) {
                    if (\is_array($this->v[$variable]) && \is_array($value)) {
                        $keys = \array_keys($value);
                        foreach ($keys as $key) {
                            if (isset($this->v[$variable][$key])) {
                                $this->v[$variable][$key] = $value[$key] . $this->v[$variable][$key];
                            } else {
                                $this->v[$variable][$key] = $value[$key];
                            }
                        }
                    } else {
                        $this->v[$variable] = $value . $this->v[$variable];
                    }
                } else {
                    $this->v[$variable] = $value;
                }
            }
        }
    }

    /**
     * Assigns a template variable by reference.
     *
     * @param string $variable
     * @param mixed $value
     */
    public function assignByRef($variable, &$value)
    {
        if (!empty($variable)) {
            $this->v[$variable] = &$value;
        }
    }

    /**
     * Clears an assignment of template variables.
     *
     * @param mixed $variables
     */
    public function clearAssign(array $variables)
    {
        foreach ($variables as $key) {
            unset($this->v[$key]);
        }
    }

    /**
     * Clears assignment of all template variables. This should not be called
     * during runtime as it could leed to an unexpected behaviour.
     */
    public function clearAllAssign()
    {
        $this->v = [];
    }

    /**
     * Outputs a template.
     *
     * @param string $templateName
     * @param string $application
     * @param bool $sendHeaders
     */
    public function display($templateName, $application = 'wcf', $sendHeaders = true)
    {
        if ($sendHeaders) {
            HeaderUtil::sendHeaders();

            EventHandler::getInstance()->fireAction($this, 'beforeDisplay');
        }

        $sourceFilename = $this->getSourceFilename($templateName, $application);
        $compiledFilename = $this->getCompiledFilename($templateName, $application);
        $metaDataFilename = $this->getMetaDataFilename($templateName);
        $metaData = $this->getMetaData($templateName, $metaDataFilename);

        // check if compilation is necessary
        if (
            $metaData === null
            || !$this->isCompiled($templateName, $sourceFilename, $compiledFilename, $application, $metaData)
        ) {
            // compile
            $this->compileTemplate($templateName, $sourceFilename, $compiledFilename, [
                'application' => $application,
                'data' => $metaData,
                'filename' => $metaDataFilename,
            ]);
        }

        // assign current package id
        $this->assign('__APPLICATION', $application);

        include($compiledFilename);

        if ($sendHeaders) {
            EventHandler::getInstance()->fireAction($this, 'afterDisplay');
        }
    }

    /**
     * Returns the absolute filename of a template source.
     *
     * @param string $templateName
     * @param string $application
     * @return  string      $path
     * @throws  SystemException
     */
    public function getSourceFilename($templateName, $application)
    {
        $sourceFilename = $this->getPath($this->templatePaths[$application], $templateName);
        if (!empty($sourceFilename)) {
            return $sourceFilename;
        }

        // try to find template within WCF if not already searching WCF
        if ($application != 'wcf') {
            $sourceFilename = $this->getSourceFilename($templateName, 'wcf');
            if (!empty($sourceFilename)) {
                return $sourceFilename;
            }
        }

        throw new SystemException("Unable to find template '" . $templateName . "'");
    }

    /**
     * Returns path if template was found.
     *
     * @param string $templatePath
     * @param string $templateName
     * @return  string
     */
    protected function getPath($templatePath, $templateName)
    {
        if (!Template::isSystemCritical($templateName)) {
            $templateGroupID = $this->getTemplateGroupID();

            while ($templateGroupID != 0) {
                $templateGroup = $this->templateGroupCache[$templateGroupID];

                $path = $templatePath . $templateGroup->templateGroupFolderName . $templateName . '.tpl';
                if (\file_exists($path)) {
                    return $path;
                }

                $templateGroupID = $templateGroup->parentTemplateGroupID;
            }
        }

        // use default template
        $path = $templatePath . $templateName . '.tpl';

        if (\file_exists($path)) {
            return $path;
        }

        return '';
    }

    /**
     * Returns the absolute filename of a compiled template.
     *
     * @param string $templateName
     * @param string $application
     * @return  string
     */
    public function getCompiledFilename($templateName, $application)
    {
        return $this->compileDir . $this->getTemplateGroupID() . '_' . $application . '_' . $this->languageID . '_' . $templateName . '.php';
    }

    /**
     * Returns the absolute filename for template's meta data.
     *
     * @param string $templateName
     * @return  string
     */
    public function getMetaDataFilename($templateName)
    {
        return $this->compileDir . $this->getTemplateGroupID() . '_' . $templateName . '.meta.php';
    }

    /**
     * Returns true if the template with the given data is already compiled.
     *
     * @param string $templateName
     * @param string $sourceFilename
     * @param string $compiledFilename
     * @param string $application
     * @param array $metaData
     * @return  bool
     */
    protected function isCompiled($templateName, $sourceFilename, $compiledFilename, $application, array $metaData)
    {
        if ($this->forceCompile || !\file_exists($compiledFilename)) {
            return false;
        } else {
            $sourceMTime = @\filemtime($sourceFilename);
            $compileMTime = @\filemtime($compiledFilename);

            if ($sourceMTime >= $compileMTime) {
                return false;
            } else {
                // check for meta data
                if (!empty($metaData['include'])) {
                    foreach ($metaData['include'] as $application => $includedTemplates) {
                        foreach ($includedTemplates as $includedTemplate) {
                            $includedTemplateFilename = $this->getSourceFilename($includedTemplate, $application);
                            $includedMTime = @\filemtime($includedTemplateFilename);

                            if ($includedMTime >= $compileMTime) {
                                return false;
                            }
                        }
                    }
                }

                return true;
            }
        }
    }

    /**
     * Compiles a template.
     *
     * @param string $templateName
     * @param string $sourceFilename
     * @param string $compiledFilename
     * @param array $metaData
     */
    protected function compileTemplate($templateName, $sourceFilename, $compiledFilename, array $metaData)
    {
        // get source
        $sourceContent = $this->getSourceContent($sourceFilename);

        // compile template
        $this->getCompiler()->compile($templateName, $sourceContent, $compiledFilename, $metaData);
    }

    /**
     * Returns the template compiler.
     *
     * @return  TemplateCompiler
     */
    public function getCompiler()
    {
        if ($this->compilerObj === null) {
            $this->compilerObj = new TemplateCompiler($this);
        }

        return $this->compilerObj;
    }

    /**
     * Reads the content of a template file.
     *
     * @param string $sourceFilename
     * @return  string
     * @throws  SystemException
     */
    public function getSourceContent($sourceFilename)
    {
        /** @noinspection PhpUnusedLocalVariableInspection */
        $sourceContent = '';
        if (!\file_exists($sourceFilename) || (($sourceContent = @\file_get_contents($sourceFilename)) === false)) {
            throw new SystemException("Could not open template '{$sourceFilename}' for reading");
        } else {
            return $sourceContent;
        }
    }

    /**
     * Returns the class name of a plugin.
     *
     * @param string $type
     * @param string $tag
     * @return  string
     */
    public function getPluginClassName($type, $tag)
    {
        return $this->pluginNamespace . StringUtil::firstCharToUpperCase($tag) . StringUtil::firstCharToUpperCase(\mb_strtolower($type)) . 'TemplatePlugin';
    }

    /**
     * Enables execution in sandbox.
     */
    public function enableSandbox()
    {
        $index = \count($this->sandboxVars);
        $this->sandboxVars[$index] = [
            'foreachVars' => $this->foreachVars,
            'v' => $this->v,
        ];
    }

    /**
     * Disables execution in sandbox.
     */
    public function disableSandbox()
    {
        if (empty($this->sandboxVars)) {
            throw new SystemException('TemplateEngine is currently not running in a sandbox.');
        }

        $values = \array_pop($this->sandboxVars);
        $this->foreachVars = $values['foreachVars'];
        $this->v = $values['v'];
    }

    /**
     * Returns the output of a template.
     *
     * @param string $templateName
     * @param string $application
     * @param array $variables
     * @param bool $sandbox enables execution in sandbox
     * @return  string
     */
    public function fetch($templateName, $application = 'wcf', array $variables = [], $sandbox = false)
    {
        // enable sandbox
        if ($sandbox) {
            $this->enableSandbox();
        }

        // add new template variables
        if (!empty($variables)) {
            $this->v = \array_merge($this->v, $variables);
        }

        // get output
        try {
            \ob_start();
            $this->display($templateName, $application, false);
            $output = \ob_get_contents();
        } finally {
            \ob_end_clean();
        }

        // disable sandbox
        if ($sandbox) {
            $this->disableSandbox();
        }

        return $output;
    }

    /**
     * Renders the template into a fresh PSR-7 StreamInterface.
     *
     * @since 5.6
     */
    public function fetchStream(
        string $templateName,
        string $application = 'wcf',
        array $variables = [],
        bool $sandbox = false
    ): StreamInterface {
        // enable sandbox
        if ($sandbox) {
            $this->enableSandbox();
        }

        // add new template variables
        if (!empty($variables)) {
            $this->v = \array_merge($this->v, $variables);
        }

        // get output
        try {
            $stream = new Stream(\fopen('php://temp', 'r+'));

            \ob_start(static function (string $buffer, int $phase) use (&$stream) {
                $stream->write($buffer);

                return '';
            }, 1024 * 1024);

            $this->display($templateName, $application, false);
        } finally {
            \ob_end_clean();
        }

        // disable sandbox
        if ($sandbox) {
            $this->disableSandbox();
        }

        $stream->rewind();

        return $stream;
    }

    /**
     * Executes a compiled template scripting source and returns the result.
     *
     * @param string $compiledSource
     * @param array $variables
     * @param bool $sandbox enables execution in sandbox
     * @return  string
     */
    public function fetchString($compiledSource, array $variables = [], $sandbox = true)
    {
        // enable sandbox
        if ($sandbox) {
            $this->enableSandbox();
        }

        // add new template variables
        if (!empty($variables)) {
            $this->v = \array_merge($this->v, $variables);
        }

        // get output
        \ob_start();
        eval('?>' . $compiledSource);
        $output = \ob_get_contents();
        \ob_end_clean();

        // disable sandbox
        if ($sandbox) {
            $this->disableSandbox();
        }

        return $output;
    }

    /**
     * Deletes all compiled templates.
     *
     * @param string $compileDir
     */
    public static function deleteCompiledTemplates($compileDir = '')
    {
        if (empty($compileDir)) {
            $compileDir = WCF_DIR . 'templates/compiled/';
        }

        // delete compiled templates
        DirectoryUtil::getInstance($compileDir)->removePattern(new Regex('.*_.*\.php$'));
    }

    /**
     * Returns an array with all prefilters.
     *
     * @return  string[]
     */
    public function getPrefilters()
    {
        return $this->prefilters;
    }

    /**
     * Returns the active template group id.
     *
     * @return  int
     */
    public function getTemplateGroupID()
    {
        return $this->templateGroupID;
    }

    /**
     * Sets the active template group id.
     *
     * @param int $templateGroupID
     */
    public function setTemplateGroupID($templateGroupID)
    {
        if ($templateGroupID && !isset($this->templateGroupCache[$templateGroupID])) {
            $templateGroupID = 0;
        }

        $this->templateGroupID = $templateGroupID;
    }

    /**
     * Loads cached template group information.
     */
    protected function loadTemplateGroupCache()
    {
        $this->templateGroupCache = TemplateGroupCacheBuilder::getInstance()->getData();
    }

    /**
     * Registers prefilters.
     *
     * @param string[] $prefilters
     */
    public function registerPrefilter(array $prefilters)
    {
        foreach ($prefilters as $name) {
            $this->prefilters[$name] = $name;
        }
    }

    /**
     * Removes a prefilter by its internal name.
     *
     * @param string $name internal prefilter identifier
     */
    public function removePrefilter($name)
    {
        unset($this->prefilters[$name]);
    }

    /**
     * Sets the dir for the compiled templates.
     *
     * @param string $compileDir
     * @throws  SystemException
     */
    public function setCompileDir($compileDir)
    {
        if (!\is_dir($compileDir)) {
            throw new SystemException("'" . $compileDir . "' is not a valid dir");
        }

        $this->compileDir = $compileDir;
    }

    /**
     * Includes a template.
     *
     * @param string $templateName
     * @param string $application
     * @param array $variables
     * @param bool $sandbox enables execution in sandbox
     */
    protected function includeTemplate($templateName, $application, array $variables = [], $sandbox = true)
    {
        // enable sandbox
        if ($sandbox) {
            $this->enableSandbox();
        }

        // add new template variables
        if (!empty($variables)) {
            $this->v = \array_merge($this->v, $variables);
        }

        // display template
        $this->display($templateName, $application, false);

        // disable sandbox
        if ($sandbox) {
            $this->disableSandbox();
        }
    }

    /**
     * Returns the value of a template variable.
     *
     * @param string $varname
     * @return  mixed
     */
    public function get($varname)
    {
        if (isset($this->v[$varname])) {
            return $this->v[$varname];
        }
    }

    /**
     * Loads template listener code.
     */
    protected function loadTemplateListenerCode()
    {
        if (!$this->templateListenersLoaded) {
            $this->templateListeners = TemplateListenerCodeCacheBuilder::getInstance()
                ->getData(['environment' => $this->environment]);
            $this->templateListenersLoaded = true;
        }
    }

    /**
     * Returns template listener's code.
     *
     * @param string $templateName
     * @param string $eventName
     * @return  string
     */
    public function getTemplateListenerCode($templateName, $eventName)
    {
        $this->loadTemplateListenerCode();

        if (isset($this->templateListeners[$templateName][$eventName])) {
            return \implode("\n", $this->templateListeners[$templateName][$eventName]);
        }

        return '';
    }

    /**
     * Reads meta data from file.
     *
     * @param string $templateName
     * @param string $filename
     * @return  array|null
     */
    protected function getMetaData($templateName, $filename)
    {
        if (!\file_exists($filename) || !\is_readable($filename)) {
            return null;
        }

        // get file contents
        $contents = \file_get_contents($filename);

        // find first newline
        $position = \strpos($contents, "\n");
        if ($position === false) {
            return null;
        }

        // cut contents
        $contents = \substr($contents, $position + 1);

        // read serializes data
        $data = @\unserialize($contents);
        if ($data === false || !\is_array($data)) {
            return null;
        }

        return $data;
    }
}
