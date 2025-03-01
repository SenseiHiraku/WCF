/**
 * Provides access to the lookup function of page handlers, allowing the user to search and
 * select page object ids.
 *
 * @author  Alexander Ebert
 * @copyright  2001-2019 WoltLab GmbH
 * @license  GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module  WoltLabSuite/Core/Ui/Page/Search/Handler
 * @woltlabExcludeBundle all
 */
define(["require", "exports", "tslib", "../../../Language", "../../../StringUtil", "../../../Dom/Util", "../../Dialog", "./Input"], function (require, exports, tslib_1, Language, StringUtil, Util_1, Dialog_1, Input_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.open = void 0;
    Language = tslib_1.__importStar(Language);
    StringUtil = tslib_1.__importStar(StringUtil);
    Util_1 = tslib_1.__importDefault(Util_1);
    Dialog_1 = tslib_1.__importDefault(Dialog_1);
    Input_1 = tslib_1.__importDefault(Input_1);
    class UiPageSearchHandler {
        constructor() {
            this.callbackSuccess = undefined;
            this.resultList = undefined;
            this.resultListContainer = undefined;
            this.searchInput = undefined;
            this.searchInputHandler = undefined;
            this.searchInputLabel = undefined;
        }
        /**
         * Opens the lookup overlay for provided page id.
         */
        open(pageId, title, callback, labelLanguageItem) {
            this.callbackSuccess = callback;
            Dialog_1.default.open(this);
            Dialog_1.default.setTitle(this, title);
            this.searchInputLabel.textContent = Language.get(labelLanguageItem || "wcf.page.pageObjectID.search.terms");
            this._getSearchInputHandler().setPageId(pageId);
        }
        /**
         * Builds the result list.
         */
        buildList(data) {
            this.resetList();
            if (!Array.isArray(data.returnValues) || data.returnValues.length === 0) {
                Util_1.default.innerError(this.searchInput, Language.get("wcf.page.pageObjectID.search.noResults"));
                return;
            }
            data.returnValues.forEach((item) => {
                let image = item.image;
                if (/^fa-/.test(image)) {
                    image = `<span class="icon icon48 ${image} pointer jsTooltip" title="${Language.get("wcf.global.select")}"></span>`;
                }
                const listItem = document.createElement("li");
                listItem.dataset.objectId = item.objectID.toString();
                const description = item.description ? `<p>${item.description}</p>` : "";
                listItem.innerHTML = `<div class="box48">
        ${image}
        <div>
          <div class="containerHeadline">
            <h3>
                <a href="#">${StringUtil.escapeHTML(item.title)}</a>
            </h3>
            ${description}
          </div>
        </div>
      </div>`;
                const link = listItem.querySelector("a");
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                });
                listItem.addEventListener("click", () => {
                    this.click(item.objectID);
                });
                this.resultList.appendChild(listItem);
            });
            Util_1.default.show(this.resultListContainer);
        }
        /**
         * Resets the list and removes any error elements.
         */
        resetList() {
            Util_1.default.innerError(this.searchInput, false);
            this.resultList.innerHTML = "";
            Util_1.default.hide(this.resultListContainer);
        }
        /**
         * Initializes the search input handler and returns the instance.
         */
        _getSearchInputHandler() {
            if (!this.searchInputHandler) {
                const input = document.getElementById("wcfUiPageSearchInput");
                this.searchInputHandler = new Input_1.default(input, {
                    callbackSuccess: this.buildList.bind(this),
                });
            }
            return this.searchInputHandler;
        }
        /**
         * Selects an item from the results.
         */
        click(objectId) {
            this.callbackSuccess(objectId);
            Dialog_1.default.close(this);
        }
        _dialogSetup() {
            return {
                id: "wcfUiPageSearchHandler",
                options: {
                    onShow: (content) => {
                        if (!this.searchInput) {
                            this.searchInput = document.getElementById("wcfUiPageSearchInput");
                            this.searchInputLabel = content.querySelector('label[for="wcfUiPageSearchInput"]');
                            this.resultList = document.getElementById("wcfUiPageSearchResultList");
                            this.resultListContainer = document.getElementById("wcfUiPageSearchResultListContainer");
                        }
                        // clear search input
                        this.searchInput.value = "";
                        // reset results
                        Util_1.default.hide(this.resultListContainer);
                        this.resultList.innerHTML = "";
                        this.searchInput.focus();
                    },
                    title: "",
                },
                source: `<div class="section">
        <dl>
          <dt>
            <label for="wcfUiPageSearchInput">${Language.get("wcf.page.pageObjectID.search.terms")}</label>
          </dt>
          <dd>
            <input type="text" id="wcfUiPageSearchInput" class="long">
          </dd>
        </dl>
      </div>
      <section id="wcfUiPageSearchResultListContainer" class="section sectionContainerList">
        <header class="sectionHeader">
          <h2 class="sectionTitle">${Language.get("wcf.page.pageObjectID.search.results")}</h2>
        </header>
        <ul id="wcfUiPageSearchResultList" class="containerList wcfUiPageSearchResultList"></ul>
      </section>`,
            };
        }
    }
    let uiPageSearchHandler = undefined;
    function getUiPageSearchHandler() {
        if (!uiPageSearchHandler) {
            uiPageSearchHandler = new UiPageSearchHandler();
        }
        return uiPageSearchHandler;
    }
    /**
     * Opens the lookup overlay for provided page id.
     */
    function open(pageId, title, callback, labelLanguageItem) {
        getUiPageSearchHandler().open(pageId, title, callback, labelLanguageItem);
    }
    exports.open = open;
});
