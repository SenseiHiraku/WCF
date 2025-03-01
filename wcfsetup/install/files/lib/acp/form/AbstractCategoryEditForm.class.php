<?php

namespace wcf\acp\form;

use wcf\data\category\Category;
use wcf\data\category\CategoryAction;
use wcf\data\category\CategoryNodeTree;
use wcf\form\AbstractForm;
use wcf\system\acl\ACLHandler;
use wcf\system\category\CategoryHandler;
use wcf\system\category\CategoryPermissionHandler;
use wcf\system\category\ICategoryType;
use wcf\system\exception\IllegalLinkException;
use wcf\system\exception\PermissionDeniedException;
use wcf\system\exception\UserInputException;
use wcf\system\language\I18nHandler;
use wcf\system\WCF;

/**
 * Abstract implementation of a form to edit a category.
 *
 * @author  Matthias Schmidt
 * @copyright   2001-2019 WoltLab GmbH
 * @license GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package WoltLabSuite\Core\Acp\Form
 */
abstract class AbstractCategoryEditForm extends AbstractCategoryAddForm
{
    /**
     * edited category
     * @var Category
     */
    public $category;

    /**
     * id of the edited category
     * @var int
     */
    public $categoryID = 0;

    /**
     * @inheritDoc
     */
    public $pageTitle = 'wcf.category.edit';

    /**
     * @inheritDoc
     */
    public function assignVariables()
    {
        parent::assignVariables();

        I18nHandler::getInstance()->assignVariables(!empty($_POST));

        $availableCategories = new CategoryNodeTree($this->objectType->objectType, 0, true);
        WCF::getTPL()->assign([
            'action' => 'edit',
            'category' => $this->category,
            'availableCategories' => $availableCategories->getIterator(),
        ]);
    }

    /**
     * @inheritDoc
     */
    protected function checkCategoryPermissions()
    {
        if ($this->category->objectTypeID != $this->objectType->objectTypeID) {
            throw new IllegalLinkException();
        }

        if (!$this->objectType->getProcessor()->canEditCategory()) {
            throw new PermissionDeniedException();
        }
    }

    /**
     * @inheritDoc
     */
    protected function readCategories()
    {
        $this->categoryNodeTree = new CategoryNodeTree(
            $this->objectType->objectType,
            0,
            true,
            [$this->category->categoryID]
        );
    }

    /**
     * @inheritDoc
     */
    public function readParameters()
    {
        parent::readParameters();

        if (isset($_REQUEST['id'])) {
            $this->categoryID = \intval($_REQUEST['id']);
        }
        $this->category = new Category($this->categoryID);
        if (!$this->category->categoryID) {
            throw new IllegalLinkException();
        }
    }

    /**
     * @inheritDoc
     */
    public function readData()
    {
        parent::readData();

        if (empty($_POST)) {
            if ($this->objectType->getProcessor()->hasDescription()) {
                I18nHandler::getInstance()->setOptions(
                    'description',
                    $this->packageID,
                    $this->category->description,
                    $this->objectType->getProcessor()->getI18nLangVarPrefix() . '.description.category\d+'
                );
            }
            I18nHandler::getInstance()->setOptions(
                'title',
                $this->packageID,
                $this->category->title,
                $this->objectType->getProcessor()->getI18nLangVarPrefix() . '.title.category\d+'
            );

            $this->additionalData = $this->category->additionalData;
            $this->descriptionUseHtml = $this->category->descriptionUseHtml;
            $this->isDisabled = $this->category->isDisabled;
            $this->parentCategoryID = $this->category->parentCategoryID;
            $this->showOrder = $this->category->showOrder;
        }
    }

    /**
     * @inheritDoc
     */
    public function save()
    {
        AbstractForm::save();

        /** @var ICategoryType $categoryType */
        $categoryType = $this->objectType->getProcessor();

        // handle description
        $description = '';
        if ($categoryType->hasDescription()) {
            $description = $categoryType->getI18nLangVarPrefix() . '.description.category' . $this->category->categoryID;
            if (I18nHandler::getInstance()->isPlainValue('description')) {
                I18nHandler::getInstance()->remove($description);
                $description = I18nHandler::getInstance()->getValue('description');
            } else {
                I18nHandler::getInstance()->save(
                    'description',
                    $description,
                    $categoryType->getDescriptionLangVarCategory(),
                    $this->packageID
                );
            }
        }

        // handle title
        $title = $categoryType->getI18nLangVarPrefix() . '.title.category' . $this->category->categoryID;
        if (I18nHandler::getInstance()->isPlainValue('title')) {
            I18nHandler::getInstance()->remove($title);
            $title = I18nHandler::getInstance()->getValue('title');
        } else {
            I18nHandler::getInstance()->save(
                'title',
                $title,
                $categoryType->getTitleLangVarCategory(),
                $this->packageID
            );
        }

        // update category
        $this->objectAction = new CategoryAction([$this->category], 'update', [
            'data' => \array_merge($this->additionalFields, [
                'additionalData' => \serialize($this->additionalData),
                'description' => $description,
                'descriptionUseHtml' => $categoryType->supportsHtmlDescription() ? $this->descriptionUseHtml : 0,
                'isDisabled' => $this->isDisabled,
                'parentCategoryID' => $this->parentCategoryID,
                'showOrder' => $this->showOrder,
                'title' => $title,
            ]),
        ]);
        $this->objectAction->executeAction();

        // update acl
        if ($this->aclObjectTypeID) {
            ACLHandler::getInstance()->save($this->category->categoryID, $this->aclObjectTypeID);
            CategoryPermissionHandler::getInstance()->resetCache();
        }

        // reload cache
        CategoryHandler::getInstance()->reloadCache();

        $this->saved();

        // show success message
        WCF::getTPL()->assign('success', true);
    }

    /**
     * @inheritDoc
     */
    protected function validateParentCategory()
    {
        parent::validateParentCategory();

        // check if new parent category is no child category of the category
        $childCategories = CategoryHandler::getInstance()->getChildCategories(
            $this->categoryID,
            $this->objectType->objectTypeID
        );
        if (isset($childCategories[$this->parentCategoryID])) {
            throw new UserInputException('parentCategoryID', 'invalid');
        }
    }
}
