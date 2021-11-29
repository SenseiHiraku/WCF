define(["require", "exports", "tslib", "../../../Date/Util", "../../../StringUtil", "../../../Dom/Change/Listener"], function (require, exports, tslib_1, Util_1, StringUtil_1, DomChangeListener) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserMenuView = void 0;
    DomChangeListener = (0, tslib_1.__importStar)(DomChangeListener);
    class UserMenuView {
        constructor(provider) {
            this.provider = provider;
            this.element = document.createElement("div");
            this.buildElement();
            this.markAllAsReadButton = this.buildButton({
                icon: '<span class="icon icon24 fa-check"></span>',
                name: "markAllAsRead",
                title: "TODO: Mark all as read",
            });
        }
        getElement() {
            return this.element;
        }
        async open() {
            this.reset();
            this.element.hidden = false;
            const data = await this.provider.getData();
            this.setContent(data);
        }
        close() {
            this.element.hidden = true;
        }
        setContent(data) {
            const content = this.getContent();
            this.markAllAsReadButton.remove();
            if (data.length === 0) {
                content.innerHTML = `<span class="userMenuContentStatus">TODO: Nothing to see here.</span>`;
            }
            else {
                let hasUnreadContent = false;
                const fragment = document.createDocumentFragment();
                data.forEach((itemData) => {
                    if (itemData.isUnread) {
                        hasUnreadContent = true;
                    }
                    fragment.append(this.createItem(itemData));
                });
                content.innerHTML = "";
                content.append(fragment);
                if (hasUnreadContent) {
                    this.element.querySelector(".userMenuButtons").prepend(this.markAllAsReadButton);
                }
                DomChangeListener.trigger();
            }
        }
        createItem(itemData) {
            const element = document.createElement("div");
            element.classList.add("userMenuItem");
            element.dataset.isUnread = itemData.isUnread ? "true" : "false";
            const link = (0, StringUtil_1.escapeHTML)(itemData.link);
            element.innerHTML = `
      <div class="userMenuItemImage">${itemData.image}</div>
      <div class="userMenuItemContent">
        <a href="${link}" class="userMenuItemLink">${itemData.content}</a>
      </div>
      <div class="userMenuItemTime"></div>
      <div class="userMenuItemUnread">
        <a href="#" class="userMenuItemMarkAsRead" role="button">
          <span class="icon icon24 fa-check jsTooltip" title="TODO: Mark as read"></span>
        </a>
      </div>
    `;
            const time = (0, Util_1.getTimeElement)(new Date(itemData.time * 1000));
            element.querySelector(".userMenuItemTime").append(time);
            const markAsRead = element.querySelector(".userMenuItemMarkAsRead");
            markAsRead.addEventListener("click", (event) => {
                event.preventDefault();
                element.dataset.isUnread = "false";
            });
            return element;
        }
        reset() {
            const content = this.getContent();
            content.innerHTML = `<span class="userMenuContentStatus">TODO: Loading…</span>`;
        }
        buildElement() {
            this.element.hidden = true;
            this.element.classList.add("userMenu");
            this.element.dataset.origin = this.provider.getPanelButtonId();
            this.element.innerHTML = `
      <div class="userMenuHeader">
        <div class="userMenuTitle">${this.provider.getTitle()}</div>
        <div class="userMenuButtons"></div>
      </div>
      <div class="userMenuContent"></div>
    `;
            // Prevent clicks inside the dialog to close it.
            this.element.addEventListener("click", (event) => {
                event.stopPropagation();
            });
            const buttons = this.element.querySelector(".userMenuButtons");
            this.provider.getButtons().forEach((button) => {
                buttons.append(this.buildButton(button));
            });
            const footer = this.provider.getFooter();
            if (footer !== null) {
                this.element.append(this.buildFooter(footer));
            }
        }
        buildButton(button) {
            const link = document.createElement("a");
            link.setAttribute("role", "button");
            link.classList.add("userMenuButton", "jsTooltip");
            link.title = button.title;
            link.innerHTML = button.icon;
            if (button.link) {
                link.href = button.link;
            }
            else {
                link.href = "#";
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    this.onButtonClick(button.name);
                });
            }
            return link;
        }
        onButtonClick(name) {
            if (name === "markAllAsRead") {
                void this.provider.markAllAsRead();
                this.getContent()
                    .querySelectorAll(".userMenuItem")
                    .forEach((element) => {
                    element.dataset.isUnread = "false";
                });
                this.markAllAsReadButton.remove();
            }
            else {
                this.provider.onButtonClick(name);
            }
        }
        buildFooter(footer) {
            const link = (0, StringUtil_1.escapeHTML)(footer.link);
            const title = (0, StringUtil_1.escapeHTML)(footer.title);
            const element = document.createElement("div");
            element.classList.add("userMenuFooter");
            element.innerHTML = `<a href="${link}" class="userMenuFooterLink">${title}</a>`;
            return element;
        }
        getContent() {
            return this.element.querySelector(".userMenuContent");
        }
    }
    exports.UserMenuView = UserMenuView;
    exports.default = UserMenuView;
});
