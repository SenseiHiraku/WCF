<?php

namespace wcf\system\cache\source;

use wcf\system\exception\SystemException;
use wcf\system\io\AtomicWriter;
use wcf\system\Regex;
use wcf\system\WCF;
use wcf\util\DirectoryUtil;
use wcf\util\FileUtil;

/**
 * DiskCacheSource is an implementation of CacheSource that stores the cache as simple files in the file system.
 *
 * @author  Alexander Ebert, Marcel Werk
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\System\Cache\Source
 */
class DiskCacheSource implements ICacheSource
{
    /**
     * up-to-date directory util object for the cache folder
     * @var DirectoryUtil
     */
    protected $directoryUtil;

    /**
     * @inheritDoc
     */
    public function flush($cacheName, $useWildcard)
    {
        if ($useWildcard) {
            $this->removeFiles('cache.' . $cacheName . '(-[a-f0-9]+)?.v1.php');
        } else {
            $this->removeFiles('cache.' . $cacheName . '.v1.php');
        }
    }

    /**
     * @inheritDoc
     */
    public function flushAll()
    {
        $this->getDirectoryUtil()->removePattern(new Regex('.*\.php$'));

        WCF::resetZendOpcache();
    }

    /**
     * @inheritDoc
     */
    public function get($cacheName, $maxLifetime)
    {
        $filename = $this->getFilename($cacheName);
        if ($this->needRebuild($filename, $maxLifetime)) {
            return;
        }

        // load cache
        try {
            return $this->readCache($cacheName, $filename);
        } catch (\Exception $e) {
            return;
        }
    }

    /**
     * @inheritDoc
     */
    public function set($cacheName, $value, $maxLifetime)
    {
        $writer = new AtomicWriter($this->getFilename($cacheName));
        $writer->write("<?php exit; /* cache: " . $cacheName . " (generated at " . \gmdate('r') . ") DO NOT EDIT THIS FILE */ ?>\n");
        $writer->write(\serialize($value));
        $writer->flush();
        $writer->close();

        // unset current DirectoryUtil object to make sure new cache file
        // can be deleted in the same request
        $this->directoryUtil = null;

        WCF::resetZendOpcache($this->getFilename($cacheName));
    }

    /**
     * Returns cache filename.
     *
     * @param string $cacheName
     * @return  string
     */
    protected function getFilename($cacheName)
    {
        return WCF_DIR . 'cache/cache.' . $cacheName . '.v1.php';
    }

    /**
     * Removes files matching given pattern.
     *
     * @param string $pattern
     */
    protected function removeFiles($pattern)
    {
        $directory = FileUtil::unifyDirSeparator(WCF_DIR . 'cache/');
        $pattern = \str_replace('*', '.*', \str_replace('.', '\.', $pattern));

        $this->getDirectoryUtil()->executeCallback(static function ($filename) {
            if (!@\touch($filename, 1)) {
                @\unlink($filename);

                WCF::resetZendOpcache($filename);
            }
        }, new Regex('^' . $directory . $pattern . '$', Regex::CASE_INSENSITIVE));
    }

    /**
     * Determines whether the cache needs to be rebuild or not.
     *
     * @param string $filename
     * @param int $maxLifetime
     * @return  bool
     */
    protected function needRebuild($filename, $maxLifetime)
    {
        // cache does not exist
        if (!\file_exists($filename)) {
            return true;
        }

        // cache is empty
        if (!@\filesize($filename)) {
            return true;
        }

        // cache resource was marked as obsolete
        if (($mtime = \filemtime($filename)) <= 1) {
            return true;
        }

        // maxlifetime expired
        if ($maxLifetime > 0 && (TIME_NOW - $mtime) > $maxLifetime) {
            return true;
        }

        // do not rebuild cache
        return false;
    }

    /**
     * Loads the file of a cached resource.
     *
     * @param string $cacheName
     * @param string $filename
     * @return  mixed
     * @throws  SystemException
     */
    protected function readCache($cacheName, $filename)
    {
        // get file contents
        $contents = \file_get_contents($filename);

        // find first newline
        $position = \strpos($contents, "\n");
        if ($position === false) {
            throw new SystemException("Unable to load cache resource '" . $cacheName . "'");
        }

        // cut contents
        $contents = \substr($contents, $position + 1);

        // unserialize
        $value = @\unserialize($contents);
        if ($value === false) {
            throw new SystemException("Unable to load cache resource '" . $cacheName . "'");
        }

        return $value;
    }

    /**
     * Returns an up-to-date directory util object for the cache folder.
     *
     * @return  DirectoryUtil
     */
    protected function getDirectoryUtil()
    {
        if ($this->directoryUtil === null) {
            $this->directoryUtil = new DirectoryUtil(WCF_DIR . 'cache/');
        }

        return $this->directoryUtil;
    }
}
