import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

const code = readFileSync("public/assets/tle-demo-order-journey-20261108.js", "utf8");
const click = (selector: string) => {
  const node = document.querySelector<HTMLButtonElement>(selector);
  expect(node, "missing interactive control: " + selector).toBeTruthy();
  node?.click();
};

describe("concept demo checkout from cart to sample confirmation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "<main><section id='collection'></section></main>";
    document.documentElement.lang = "en";
    const script = document.createElement("script");
    script.dataset.tleOrderSlug = "golden-grid";
    Object.defineProperty(document, "currentScript", { configurable: true, get: () => script });
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function () { this.setAttribute("open", ""); }
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: function () { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); }
    });
    (window as any).TLE_DEMO_PRICE_CATALOGS = {
      "golden-grid": {
        kind: "menu", tone: "#b88625",
        items: [
          { name: "The Golden Classic", priceCents: 1300, image: "" },
          { name: "The At-Home Ritual", priceCents: 1620, image: "" }
        ]
      }
    };
    new Function(code)();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.querySelector("#tle-demo-order-css")?.remove();
    document.querySelector(".tle-order-float")?.remove();
    document.querySelector(".tle-order-modal")?.remove();
    delete (window as any).TLE_ORDER;
    delete (window as any).TLE_DEMO_PRICE_CATALOGS;
    delete (document as any).currentScript;
  });

  it("keeps catalog prices, captures only transient details and reaches a DEMO confirmation", () => {
    expect(document.querySelector(".tle-order-float")).not.toBeNull();
    click(".tle-order-float");
    expect(document.querySelector(".tle-order-modal")?.hasAttribute("open")).toBe(true);
    click('[data-action="add"][data-name="The Golden Classic"]');
    click('[data-action="add"][data-name="The At-Home Ritual"]');
    click('[data-action="cart"]');
    expect(document.querySelector(".tle-order-footer")?.textContent).toContain("$29.20");
    click('[data-action="details"]');

    const form = document.querySelector<HTMLFormElement>("#tle-order-details")!;
    (form.elements.namedItem("customer") as HTMLInputElement).value = "Example Customer";
    (form.elements.namedItem("email") as HTMLInputElement).value = "test@example.com";
    const fulfillment = form.elements.namedItem("fulfillment") as HTMLSelectElement;
    fulfillment.value = "delivery";
    fulfillment.dispatchEvent(new Event("change", { bubbles: true }));
    (form.elements.namedItem("address") as HTMLInputElement).value = "Example Street, Test City";
    expect((form.elements.namedItem("address") as HTMLInputElement).required).toBe(true);
    click('[data-action="review"]');
    expect(document.querySelector(".tle-order-body")?.textContent).toContain("Example Customer");
    click('[data-action="confirm"]');
    const receipt = document.querySelector(".tle-order-body")?.textContent || "";
    expect(receipt).toContain("DEMO-");
    expect(receipt).toContain("$29.20");
    expect(receipt).toContain("Nothing was ordered, paid for, or sent.");
    expect(document.querySelector(".tle-order-float")?.textContent).toContain("0");
  });

  it("does not include network posting, card collection or false email promises", () => {
    expect(code).not.toMatch(/fetch\s*\(|XMLHttpRequest|sendBeacon|paymentMethod\.create|card_number/i);
    expect(code).toContain("No payment gateway");
    expect(code).toContain("no customer details are sent or saved");
  });
});