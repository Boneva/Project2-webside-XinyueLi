
function updateMBTIValue(id, leftChar, rightChar) {
  const slider = document.getElementById(id);
  const valueDisplay = document.getElementById(`${id}-value`);
  valueDisplay.textContent = slider.value === "0" ? leftChar : rightChar;
}
