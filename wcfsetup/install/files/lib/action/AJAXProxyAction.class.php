<?php

namespace wcf\action;

use wcf\data\IDatabaseObjectAction;
use wcf\system\exception\ImplementationException;
use wcf\system\exception\ParentClassException;
use wcf\system\exception\UserInputException;
use wcf\system\WCF;
use wcf\system\WCFACP;
use wcf\util\ArrayUtil;
use wcf\util\StringUtil;

/**
 * Default implementation for object-actions using the AJAX-API.
 *
 * @author  Marcel Werk
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\Action
 */
class AJAXProxyAction extends AJAXInvokeAction
{
    /**
     * interface name
     * @var string
     */
    protected $interfaceName = '';

    /**
     * object action
     * @var IDatabaseObjectAction
     */
    protected $objectAction;

    /**
     * list of object ids
     * @var int[]
     */
    protected $objectIDs = [];

    /**
     * additional parameters
     * @var mixed[]
     */
    protected $parameters = [];

    /**
     * @inheritDoc
     */
    public function readParameters()
    {
        parent::readParameters();

        if (isset($_POST['interfaceName'])) {
            $this->interfaceName = StringUtil::trim($_POST['interfaceName']);
        }
        if (isset($_POST['objectIDs']) && \is_array($_POST['objectIDs'])) {
            $this->objectIDs = ArrayUtil::toIntegerArray($_POST['objectIDs']);
        }
        if (isset($_POST['parameters']) && \is_array($_POST['parameters'])) {
            $this->parameters = $_POST['parameters'];
        }
    }

    /**
     * @inheritDoc
     */
    protected function invoke()
    {
        try {
            if (!\is_subclass_of($this->className, IDatabaseObjectAction::class)) {
                throw new ImplementationException($this->className, IDatabaseObjectAction::class);
            }

            if (!empty($this->interfaceName)) {
                if (!\is_subclass_of($this->className, $this->interfaceName)) {
                    throw new ImplementationException($this->className, $this->interfaceName);
                }
            }
        } catch (ImplementationException | ParentClassException $e) {
            throw new UserInputException('className', $e->getMessage());
        }

        // create object action instance
        $this->objectAction = new $this->className($this->objectIDs, $this->actionName, $this->parameters);

        // validate action
        $this->objectAction->validateAction();

        // execute action
        $this->response = $this->objectAction->executeAction();
    }

    /**
     * @inheritDoc
     */
    protected function sendResponse()
    {
        // add benchmark and debug data
        if (ENABLE_BENCHMARK) {
            /** @noinspection PhpUndefinedMethodInspection */
            $this->response['benchmark'] = [
                'executionTime' => WCF::getBenchmark()->getExecutionTime() . 's',
                'memoryUsage' => WCF::getBenchmark()->getMemoryUsage(),
                'phpExecution' => StringUtil::formatNumeric((WCF::getBenchmark()->getExecutionTime() - WCF::getBenchmark()->getQueryExecutionTime()) / WCF::getBenchmark()->getExecutionTime() * 100) . '%',
                'sqlExecution' => StringUtil::formatNumeric(WCF::getBenchmark()->getQueryExecutionTime() / WCF::getBenchmark()->getExecutionTime() * 100) . '%',
                'sqlQueries' => WCF::getBenchmark()->getQueryCount(),
            ];

            if (ENABLE_DEBUG_MODE) {
                /** @noinspection PhpUndefinedMethodInspection */
                $this->response['benchmark']['items'] = WCF::getBenchmark()->getItems();
            }
        }

        // force background queue invocation
        if (!\class_exists(WCFACP::class, false) && WCF::getSession()->getVar('forceBackgroundQueuePerform')) {
            $this->response['forceBackgroundQueuePerform'] = true;
        }

        parent::sendResponse();
    }
}
