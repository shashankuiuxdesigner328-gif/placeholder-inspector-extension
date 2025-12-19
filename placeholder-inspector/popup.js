document.getElementById("inspect").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: inspectPlaceholder
  }, (results) => {
    document.getElementById("result").textContent =
      results?.[0]?.result || "No input selected";
  });
});

function inspectPlaceholder() {
  const el = document.activeElement;

  if (!el || !["INPUT", "TEXTAREA"].includes(el.tagName)) {
    return "❌ Please click inside an input or textarea";
  }

  const styles = getComputedStyle(el, "::placeholder");

  // Convert rgb/rgba to HEX
  function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (!result) return "N/A";

    return (
      "#" +
      result
        .slice(0, 3)
        .map(x => parseInt(x).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }

  // Convert opacity to %
  const opacityPercent = styles.opacity
    ? `${Math.round(parseFloat(styles.opacity) * 100)}%`
    : "100%";

  return `
Placeholder Text: "${el.placeholder}"

Font Size: ${styles.fontSize}
Font Family: ${styles.fontFamily}
Color (HEX): ${rgbToHex(styles.color)}
Opacity: ${opacityPercent}
  `;
}
