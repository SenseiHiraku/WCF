import { dboAction } from "../../../../Ajax";
import UserMenuView from "../View";
import { UserMenuButton, UserMenuData, UserMenuFooter, UserMenuProvider } from "./Provider";

let originalFavicon = "";
function updateUnreadCounter(counter: number): void {
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]');
  if (!favicon) {
    return;
  }

  if (!originalFavicon) {
    originalFavicon = favicon.href;
  }

  const text = Math.trunc(counter).toString();
  if (text === "0") {
    favicon.href = originalFavicon;

    return;
  }

  const img = document.createElement("img");
  img.src = originalFavicon;
  img.addEventListener("load", () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      drawCounter(ctx, text);

      favicon.href = canvas.toDataURL("image/png");
    }
  });
}

// This is a cut-down version of `Favico.js` v0.3.10 which is both unmaintained
// since 2016 and quite bloated.
//
// Source: https://github.com/ejci/favico.js
// Author: Miroslav Magda, http://blog.ejci.net
// License: MIT or GPL-2.0
function drawCounter(ctx: CanvasRenderingContext2D, counter: string): void {
  const size = ctx.canvas.width;

  let more = false;
  let x = 0.4 * size;
  const y = 0.4 * size;
  let width = 0.6 * size;
  const height = 0.6 * size;
  if (counter.length === 2) {
    x = x - width * 0.4;
    width = width * 1.4;
    more = true;
  } else if (counter.length >= 3) {
    x = x - width * 0.65;
    width = width * 1.65;
    more = true;
  }

  ctx.beginPath();
  ctx.fillStyle = "#d00";

  if (more) {
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width - height / 2, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + height / 2);
    ctx.lineTo(x + width, y + height - height / 2);
    ctx.quadraticCurveTo(x + width, y + height, x + width - height / 2, y + height);
    ctx.lineTo(x + height / 2, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - height / 2);
    ctx.lineTo(x, y + height / 2);
    ctx.quadraticCurveTo(x, y, x + height / 2, y);
  } else {
    ctx.arc(x + width / 2, y + height / 2, height / 2, 0, 2 * Math.PI);
  }

  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.stroke();
  ctx.font = "bold " + Math.floor(height * (counter.length > 2 ? 0.85 : 1)).toString() + "px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";

  if (counter.length > 3) {
    ctx.fillText(
      (counter.length > 4 ? 9 : Math.floor(+counter / 1000)).toString() + "k+",
      Math.floor(x + width / 2),
      Math.floor(y + height - height * 0.2),
    );
  } else {
    ctx.fillText(counter, Math.floor(x + width / 2), Math.floor(y + height - height * 0.15));
  }

  ctx.closePath();
}

export class UserMenuDataNotification implements UserMenuProvider {
  private readonly button: HTMLElement | null;
  private view: UserMenuView | undefined = undefined;

  constructor() {
    this.button = document.getElementById("userNotifications");

    if (this.button) {
      const badge = this.button.querySelector<HTMLElement>(".badge");
      if (badge) {
        const counter = parseInt(badge.textContent!.trim());
        if (counter) {
          updateUnreadCounter(counter);
        }
      }

      // TODO: Migrate this!
      window.WCF.System.PushNotification.addCallback("userNotificationCount", (count: number) =>
        this.updateUserNotificationCount(count, badge),
      );
    }
  }

  private updateUserNotificationCount(count: number, badge: HTMLElement | null): void {
    // TODO: Reset the view

    // TODO: This should be part of `View.ts`?
    if (badge === null && count > 0) {
      badge = document.createElement("span");
      badge.classList.add("badge badgeUpdate");

      this.button?.querySelector("a")!.append(badge);
    }

    if (count > 0) {
      badge!.textContent = count.toString();
    } else if (badge) {
      badge.remove();
    }

    updateUnreadCounter(count);
  }

  getButtons(): UserMenuButton[] {
    return [
      {
        icon: '<span class="icon icon24 fa-cog"></span>',
        link: "#todo-notification-settings",
        name: "settings",
        title: "TODO: Settings",
      },
    ];
  }

  async getData(): Promise<UserMenuData[]> {
    const data = (await dboAction(
      "getNotificationData",
      "wcf\\data\\user\\notification\\UserNotificationAction",
    ).dispatch()) as UserMenuData[];

    const counter = data.filter((item) => item.isUnread).length;
    updateUnreadCounter(counter);

    return data;
  }

  getFooter(): UserMenuFooter | null {
    return {
      link: "https://example.com",
      title: "TODO: Show All Notifications",
    };
  }

  getPanelButtonId(): string {
    return "userNotifications";
  }

  getTitle(): string {
    return "TODO: Notifications";
  }

  getView(): UserMenuView {
    if (this.view === undefined) {
      this.view = new UserMenuView(this);
    }

    return this.view;
  }

  async markAllAsRead(): Promise<void> {
    await dboAction("markAllAsConfirmed", "wcf\\data\\user\\notification\\UserNotificationAction").dispatch();
  }

  onButtonClick(name: string): void {
    console.log("Clicked on", name);
  }
}
