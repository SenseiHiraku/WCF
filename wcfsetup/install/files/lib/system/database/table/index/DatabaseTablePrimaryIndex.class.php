<?php

namespace wcf\system\database\table\index;

/**
 * Represents a primary index of a database table.
 *
 * This class just provides a shorter factory method that automatically sets the name and type of
 * the primary index.
 *
 * @author  Matthias Schmidt
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\System\Database\Table\Index
 * @since   5.2
 */
final class DatabaseTablePrimaryIndex
{
    /**
     * Returns a `DatabaseTableIndex` object with `PRIMARY` as name and primary as type.
     */
    public static function create(): DatabaseTableIndex
    {
        return DatabaseTableIndex::create('PRIMARY')
            ->type(DatabaseTableIndex::PRIMARY_TYPE);
    }

    private function __construct()
    {
    }
}
