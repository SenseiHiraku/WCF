<?php
namespace wcf\system\devtools\pip;
use wcf\system\form\builder\field\IFormField;
use wcf\system\form\builder\IFormDocument;
use wcf\system\form\builder\IFormNode;
use wcf\system\package\PackageInstallationDispatcher;
use wcf\util\DOMUtil;
use wcf\util\XML;

/**
 * Provides default implementations of the methods of the
 * 	`wcf\system\devtools\pip\IGuiPackageInstallationPlugin`
 * interface for an xml-based package installation plugin that works with multiple
 * files at once.
 * 
 * @author	Matthias Schmidt
 * @copyright	2001-2018 WoltLab GmbH
 * @license	GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @package	WoltLabSuite\Core\System\Devtools\Pip
 * @since	3.2
 * 
 * @property	PackageInstallationDispatcher|DevtoolsPackageInstallationDispatcher	$installation
 */
trait TMultiXmlGuiPackageInstallationPlugin {
	use TXmlGuiPackageInstallationPlugin;
	
	/**
	 * dom elements representing the original data of the edited entry
	 * @var	\DOMElement[]
	 */
	protected $editedEntries;
	
	/**
	 * Adds a new entry of this pip based on the data provided by the given
	 * form.
	 *
	 * @param	IFormDocument		$form
	 */
	public function addEntry(IFormDocument $form) {
		foreach ($this->getProjectXmls() as $xml) {
			$document = $xml->getDocument();
			
			$newElement = $this->createXmlElement($document, $form);
			$this->insertNewXmlElement($xml, $newElement);
			
			$this->saveObject($newElement);
			
			// TODO: while creating/testing the gui, write into a temporary file
			// $xml->write($this->getXmlFileLocation($project));
			$xml->write(substr($xml->getPath(), 0, -4) . '_tmp.xml');
		}
	}
	
	/**
	 * Edits the entry of this pip with the given identifier based on the data
	 * provided by the given form and returns the new identifier of the entry
	 * (or the old identifier if it has not changed).
	 *
	 * @param	IFormDocument		$form
	 * @param	string			$identifier
	 * @return	string			new identifier
	 */
	public function editEntry(IFormDocument $form, $identifier) {
		$newEntry = null;
		foreach ($this->getProjectXmls() as $xml) {
			$document = $xml->getDocument();
			
			// add updated element
			$newElement = $this->createXmlElement($document, $form);
			
			// replace old element
			$element = $this->getElementByIdentifier($xml, $identifier);
			DOMUtil::replaceElement($newElement, $element);
			
			$this->saveObject($newEntry, $element);
			
			// TODO: while creating/testing the gui, write into a temporary file
			// $xml->write($this->getXmlFileLocation($project));
			$xml->write(substr($xml->getPath(), 0, -4) . '_tmp.xml');
		}
		
		if ($newEntry === null) {
			throw new \UnexpectedValueException("Have not edited any entry");
		}
		
		return $this->getElementIdentifier($newEntry);
	}
	
	/**
	 * Returns a list of all pip entries of this pip.
	 *
	 * @return	IDevtoolsPipEntryList
	 */
	public function getEntryList() {
		$entryList = new DevtoolsPipEntryList();
		$this->setEntryListKeys($entryList);
		
		foreach ($this->getProjectXmls() as $xml) {
			$xpath = $xml->xpath();
			
			/** @var \DOMElement $element */
			foreach ($this->getImportElements($xpath) as $element) {
				$entryList->addEntry(
					$this->getElementIdentifier($element),
					array_intersect_key($this->getElementData($element), $entryList->getKeys())
				);
			}
		}
		
		return $entryList;
	}
	
	/**
	 * Returns the xml objects for this pip.
	 * 
	 * @return	XML[]
	 */
	abstract protected function getProjectXmls();
	
	/**
	 * @inheritDoc
	 */
	public function setEditedEntryIdentifier($identifier) {
		$editedEntries = [];
		foreach ($this->getProjectXmls() as $xml) {
			$editedEntry = $this->getElementByIdentifier($xml, $identifier);
			
			if ($editedEntry !== null) {
				$editedEntries[] = $editedEntry;
			}
		}
		
		if (empty($editedEntries)) {
			throw new \InvalidArgumentException("Unknown entry with identifier '{$identifier}'.");
		}
		
		$this->editedEntries = $editedEntries;
	}
	
	/**
	 * @inheritDoc
	 */
	public function setEntryData($identifier, IFormDocument $document) {
		$xmls = $this->getProjectXmls();
		$missingElements = 0;
		
		foreach ($xmls as $xml) {
			$element = $this->getElementByIdentifier($xml, $identifier);
			if ($element === null) {
				$missingElements++;
				
				continue;
			}
			
			$data = $this->getElementData($element);
			
			/** @var IFormNode $node
			 */
			foreach ($document->getIterator() as $node) {
				if ($node instanceof IFormField && $node->isAvailable()) {
					$key = $node->getId();
					
					if (isset($data[$key])) {
						$node->value($data[$key]);
					}
					else if ($node->getObjectProperty() !== $node->getId()) {
						$key = $node->getObjectProperty();
						
						try {
							if (isset($data[$key])) {
								$node->value($data[$key]);
							}
						}
						catch (\InvalidArgumentException $e) {
							// ignore invalid argument exceptions for fields with object property
							// as there might be multiple fields with the same object property but
							// different possible values (for example when using single selection
							// form fields to set the parent element)
						}
					}
				}
			}
		}
		
		return $missingElements !== count($xmls);
	}
}
