const inspectBtn = document.getElementById("inspectBtn");
const resultBox = document.getElementById("result");

inspectBtn.addEventListener("click", async () => {
  resultBox.textContent = "Inspecting...";
  resultBox.className = "result-box";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: inspectPlaceholder
      },
      (results) => {
        const response = results?.[0]?.result;

        if (!response) {
          showError("No input selected");
        } else if (response.startsWith("❌")) {
          showError(response.replace("❌", "").trim());
        } else {
          resultBox.textContent = response;
        }
      }
    );
  } catch (err) {
    showError("Something went wrong");
  }
});

function showError(message) {
  resultBox.textContent = message;
  resultBox.classList.add("error");
}

/* -------- Content Script Function -------- */

function inspectPlaceholder() {
  const el = document.activeElement;

  if (!el || !["INPUT", "TEXTAREA"].includes(el.tagName)) {
    return "❌ Please click inside an input or textarea";
  }

  const styles = getComputedStyle(el, "::placeholder");

  const rgbToHex = (rgb) => {
    const values = rgb.match(/\d+/g);
    if (!values) return "N/A";

    return (
      "#" +
      values
        .slice(0, 3)
        .map(v => parseInt(v).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  };

  const opacity = styles.opacity
    ? `${Math.round(parseFloat(styles.opacity) * 100)}%`
    : "100%";

  return `
Placeholder Text:
"${el.placeholder || "—"}"

Font Size:
${styles.fontSize}

Font Family:
${styles.fontFamily}

Color:
${rgbToHex(styles.color)}

Opacity:
${opacity}
`;
}
