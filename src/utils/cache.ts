/* eslint-disable react-hooks/rules-of-hooks */

type VisibilityValue = 'Invisible' | 'Private' | 'Shareable' | 'Public';
type VisibilityKey = 0 | 1 | 2 | 3;

/**
 * Convert a type of visibility to what Robokache is expecting
 * @param {('Invisible'|'Private'|'Shareable'|'Public')} value
 */
function useVisibility() {
  const visibilityMapping: Record<VisibilityKey, VisibilityValue> = {
    0: 'Invisible',
    1: 'Private',
    2: 'Shareable',
    3: 'Public',
  };

  function toString(key: VisibilityKey): VisibilityValue {
    return visibilityMapping[key];
  }

  function toInt(val: VisibilityValue): VisibilityKey {
    const entries = Object.entries(visibilityMapping);
    const foundEntry = entries.find(([_, value]) => value === val);
    return parseInt(foundEntry?.[0] || '0', 10) as VisibilityKey;
  }

  return {
    toString,
    toInt,
  };
}

function formatDateTimeNicely(dateString: string): string {
  const jsDate = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: 'long',
    timeStyle: 'long',
    hour12: true,
  };
  return Intl.DateTimeFormat('en-US', options).format(jsDate);
}

function formatDateTimeShort(dateString: string): string {
  const jsDate = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: true,
  };
  return Intl.DateTimeFormat('en-US', options).format(jsDate);
}

/**
 * Default new question object for Robokache
 */
const defaultQuestion = {
  parent: '',
  visibility: useVisibility().toInt('Shareable'),
  metadata: { name: 'New Question' },
};

/**
 * Default new answer only object for Robokache
 */
const defaultAnswer = {
  parent: '',
  visibility: useVisibility().toInt('Shareable'),
  metadata: {
    name: 'Uploaded Answer',
    answerOnly: true,
    hasAnswers: true,
  },
};

export { useVisibility, formatDateTimeNicely, formatDateTimeShort, defaultQuestion, defaultAnswer };
