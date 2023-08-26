/**
 * Sleeps for the give number of milliseconds.
 *
 * @param ms The number of milliseconds to sleep for.
 */
export const sleep = (ms: number): Promise<true> => {
  return new Promise((r) => setTimeout(r, ms)).then(() => true);
};

/**
 * @param {HTMLElement|Node} element
 * @param {string} className
 * @returns {boolean}
 */
export function browserHasParentClass(element, className) {
  do {
    if (element.classList && element.classList.contains(className)) {
      return true;
    }
    element = element.parentNode;
  } while (element);

  return false;
}

/**
 * Inserts a node after an existing node.
 *
 * @param newNode The node to insert.
 * @param existingNode The node to insert after.
 */
export const insertAfter = (newNode: Element, existingNode: Element): void => {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
};

export const scaleImage = ({
  width,
  height,
  maxWidth,
  maxHeight
}: {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}): { height: number; width: number } => {
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const bestRatio = Math.min(widthRatio, heightRatio);
  const newWidth = width * bestRatio;
  const newHeight = height * bestRatio;

  return {
    height: Math.ceil(newHeight),
    width: Math.ceil(newWidth)
  };
};

export const calculateNewDimensions = (originalWidth: number, originalHeight: number, maxWidth: number) => {
  if (originalWidth <= maxWidth) {
    // If the original width is already within the limit, no need to resize
    return {
      width: originalWidth,
      height: originalHeight
    };
  }

  const aspectRatio = originalWidth / originalHeight;
  const newWidth = maxWidth;
  const newHeight = Math.round(newWidth / aspectRatio);

  return {
    width: newWidth,
    height: newHeight
  };
};

/**
 * Returns a boolean value indicating whether the user has dark mode enabled.
 */
export const isDarkMode = (): boolean => {
  const element = document.querySelector('html') as HTMLElement;

  return element && element.classList.contains('theme-dark');
};
