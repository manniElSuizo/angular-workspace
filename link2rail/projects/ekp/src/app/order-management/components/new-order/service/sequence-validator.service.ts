import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' 
})
export class SequenceValidatorService {
  
  // Function to check if a number sequence is valid
  isNumberSequenceValid(sequence: string, firstPosition: number, lastPosition: number): boolean {
    if (!sequence) {
      return true;
    }

    sequence = String(sequence); // Ensure the sequence is a string

    // Ensure lastPosition is within bounds
    if (lastPosition < 0 || lastPosition >= sequence.length) {
      return false;
    }

    const checkDigit = sequence.charAt(lastPosition); // Get the character at the last position
    const calculatedCheckDigit = this.calcCheckDigit(sequence.substring(firstPosition, lastPosition));
    const lengthCheckSequence = firstPosition + lastPosition + 1; // Calculate length check

    return sequence.length === lengthCheckSequence && checkDigit === calculatedCheckDigit;
  }

  // Function to calculate the check digit using the Luhn algorithm
  private calcCheckDigit(number: string): string | null {
    if (!number) {
      return null; // Return null if no number is provided
    }

    const reversedNumber = this.reverseNumber(number);
    let crossSum = 0;

    // Iterate through the number and calculate the cross sum
    for (let i = 0; i < reversedNumber.length; i++) {
      const digit = parseInt(reversedNumber.charAt(i), 10); // Parse the digit as an integer

      // Even-indexed digits are doubled
      const calculatedNumber = i % 2 === 0 ? digit * 2 : digit;

      // If the number is greater than 9, calculate the cross sum of the number
      crossSum += calculatedNumber > 9 ? this.getCrossSumGreaterNine(calculatedNumber) : calculatedNumber;
    }

    const crossSumModulo10 = crossSum % 10;
    return (crossSumModulo10 ? 10 - crossSumModulo10 : crossSumModulo10).toString();
  }

  // Function to reverse a number as a string
  private reverseNumber(number: string): string {
    return number.split('').reverse().join(''); // Split, reverse, and join the number for cleaner code
  }

  // Function to calculate the cross sum of a number greater than 9
  private getCrossSumGreaterNine(number: number): number {
    return number
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0); // Calculate the sum of digits using reduce
  }
}
