<?php

namespace wcf\system\database\table\column;

/**
 * Represents a `tinyint` database table column with length `1`, default value `0` and whose values
 * cannot be `null`.
 *
 * @author  Matthias Schmidt
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\System\Database\Table\Column
 * @since   5.2
 */
final class DefaultFalseBooleanDatabaseTableColumn
{
    public static function create($name): IDatabaseTableColumn
    {
        return TinyintDatabaseTableColumn::create($name)
            ->length(1)
            ->notNull()
            ->defaultValue(0);
    }

    private function __construct()
    {
    }
}
