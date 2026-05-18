export function numberToWords(num: number): string {
  if (num === 0) return 'Zero BDT Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const scales = ['', 'Thousand', 'Million', 'Billion'];

  // Split into whole BDT and Paisa
  const parts = num.toFixed(2).split('.');
  const wholeNumber = parseInt(parts[0], 10);
  const decimalNumber = parseInt(parts[1], 10);

  function convertChunk(n: number): string {
    let chunkWords = '';
    if (n >= 100) {
      chunkWords += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      chunkWords += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      chunkWords += ones[n] + ' ';
    }
    return chunkWords.trim();
  }

  let tempNum = wholeNumber;
  let wordResult = '';
  let scaleIndex = 0;

  while (tempNum > 0) {
    const chunk = tempNum % 1000;
    if (chunk > 0) {
      const chunkWords = convertChunk(chunk);
      wordResult = chunkWords + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + ' ' + wordResult;
    }
    tempNum = Math.floor(tempNum / 1000);
    scaleIndex++;
  }

  wordResult = wordResult.trim();

  // If there's a decimal/paisa part
  let decimalWords = '';
  if (decimalNumber > 0) {
    decimalWords = ' and ' + convertChunk(decimalNumber) + ' Paisa';
  }

  if (!wordResult) {
    wordResult = 'Zero';
  }

  return `${wordResult}${decimalWords} BDT Only`.replace(/\s+/g, ' ').trim();
}
