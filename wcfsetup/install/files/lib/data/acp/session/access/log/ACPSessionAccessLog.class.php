<?php

namespace wcf\data\acp\session\access\log;

use wcf\data\DatabaseObject;
use wcf\util\UserUtil;

/**
 * Represents a acp session access log entry.
 *
 * @author  Marcel Werk
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\Data\Acp\Session\Access\Log
 *
 * @property-read   int $sessionAccessLogID unique id of the acp session access log entry
 * @property-read   int $sessionLogID       id of the acp session log entry the access log entry belongs to
 * @property-read   string $ipAddress      ip address of the user who has caused the acp session access log entry
 * @property-read   int $time           timestamp at which the acp session access log entry has been created
 * @property-read   string $requestURI     uri of the logged request
 * @property-read   string $requestMethod      used request method (`GET`, `POST`)
 * @property-read   string $className      name of the PHP controller class
 */
class ACPSessionAccessLog extends DatabaseObject
{
    /**
     * @inheritDoc
     */
    protected static $databaseTableIndexName = 'sessionAccessLogID';

    /**
     * @deprecated 5.5 This method is long broken.
     */
    public function hasProtectedURI()
    {
        return true;
    }

    /**
     * Returns the ip address and attempts to convert into IPv4.
     *
     * @return  string
     */
    public function getIpAddress()
    {
        return UserUtil::convertIPv6To4($this->ipAddress);
    }
}
