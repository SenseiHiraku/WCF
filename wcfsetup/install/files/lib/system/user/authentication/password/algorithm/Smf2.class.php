<?php

namespace wcf\system\user\authentication\password\algorithm;

use ParagonIE\ConstantTime\Hex;
use wcf\system\user\authentication\password\IPasswordAlgorithm;

/**
 * Implementation of the password algorithm for Simple Machines Forums 2.x (smf2).
 *
 * @author  Joshua Ruesweg
 * @copyright   2001-2020 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\System\User\Authentication\Password\Algorithm
 * @since   5.4
 */
final class Smf2 implements IPasswordAlgorithm
{
    /**
     * @inheritDoc
     */
    public function verify(
        #[\SensitiveParameter]
        string $password,
        string $hash
    ): bool {
        $parts = \explode(':', $hash, 2);
        $hash = $parts[0];
        $salt = $parts[1] ?? '';

        return \hash_equals($hash, $this->hashWithSalt($password, $salt));
    }

    /**
     * @inheritDoc
     */
    public function hash(
        #[\SensitiveParameter]
        string $password
    ): string {
        $salt = Hex::encode(\random_bytes(20));

        return $this->hashWithSalt($password, $salt) . ':' . $salt;
    }

    /**
     * Returns the hashed password, hashed with a given salt.
     */
    private function hashWithSalt(
        #[\SensitiveParameter]
        string $password,
        string $salt
    ): string {
        return \sha1($salt . $password);
    }

    /**
     * @inheritDoc
     */
    public function needsRehash(string $hash): bool
    {
        return false;
    }
}
