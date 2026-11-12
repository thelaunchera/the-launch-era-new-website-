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
    script.src = "https://thelaunchera.com/assets/tle-demo-order-journey-20261108.js";
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
    document.querySelectorAll('link[href*="tle-demo-confirmation"], script[src*="tle-demo-confirmation"]').forEach(node => node.remove());
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
    expect(receipt).toContain("No order, payment, reservation or email was created.");
    expect(receipt).not.toContain("Example Customer");
    expect(receipt).not.toContain("test@example.com");
    const disclosure = document.querySelector<HTMLDetailsElement>('[data-receipt-disclosure]')!;
    expect(disclosure.open).toBe(false);
    disclosure.open = true;
    expect(Array.from(disclosure.querySelectorAll("li"), row => row.textContent)).toEqual([
      "1 × The Golden Classic$13.00", "1 × The At-Home Ritual$16.20"
    ]);
    click('[data-action="close"]');
    click(".tle-order-float");
    expect(document.querySelector(".tle-order-body")?.textContent).toContain("DEMO-");
    click('[data-action="reset"]');
    expect(document.querySelector("[data-demo-receipt]")).toBeNull();
    expect(document.querySelector(".tle-order-float")?.textContent).toContain("0");
  });

  it("does not include network posting, card collection or false email promises", () => {
    expect(code).not.toMatch(/fetch\s*\(|XMLHttpRequest|sendBeacon|paymentMethod\.create|card_number/i);
    expect(code).toContain("No payment gateway");
    expect(code).toContain("no customer details are sent or saved");
  });
});
describe("brand-scoped cart flight duration", () => {
  it("keeps WOK's bag updated immediately while applying its configured slow flight", () => {
    vi.useFakeTimers();
    document.documentElement.lang = "en";
    document.body.innerHTML = "<header class='site-header'></header><main><section class='menu-grid'><article class='dish'><h3>Chili Oil Noodles</h3></article></section></main>";
    const source = document.createElement("script");
    source.dataset.tleOrderSlug = "wok-social";
    source.dataset.tleCartFlightMs = "2400";
    Object.defineProperty(document, "currentScript", { configurable: true, get: () => source });
    (window as any).TLE_DEMO_PRICE_CATALOGS = {
      "wok-social": {kind:"menu",tone:"#bd312d",items:[{name:"Chili Oil Noodles",priceCents:1400,image:"./bowl.webp"}]}
    };
    const flyDot=vi.fn(() => Promise.resolve());
    (window as any).TLECartMotion={flyDot};
    try {
      new Function(code)();
      const bag=document.querySelector<HTMLButtonElement>("header .tle-order-float")!;
      const add=document.querySelector<HTMLButtonElement>(".menu-grid .tle-order-inline-add")!;
      expect(bag).toBeTruthy();
      expect(add).toBeTruthy();
      add.click();
      expect(bag.textContent).toContain("1");
      expect(flyDot).toHaveBeenCalledWith(add,bag,expect.objectContaining({duration:2400}));
      expect(document.querySelector<HTMLDialogElement>("#tle-demo-order-dialog")?.open).toBe(false);
      vi.advanceTimersByTime(9001);
    } finally {
      document.querySelector("#tle-demo-order-css")?.remove();
      delete (window as any).TLE_DEMO_PRICE_CATALOGS;
      delete (window as any).TLE_ORDER;
      delete (window as any).TLECartMotion;
      delete (document as any).currentScript;
      vi.useRealTimers();
    }
  });
});
