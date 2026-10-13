import { SecondaryOptions } from './enum.constant';

// Enum definition lives in ./enum.constant; re-exported here alongside its helper.
export { SecondaryOptions };

export class SecondaryOptionHelper {
  /**
   * Pass code/key and get value
   * Example: "X2" => 4
   */
  static getValue(code: string): number | null {
    return SecondaryOptions[code as keyof typeof SecondaryOptions] ?? null;
  }

  /**
   * Pass value and get code/key
   * Example: 4 => "X2"
   */
  static getCode(value: number): string | null {
    return SecondaryOptions[value] ?? null;
  }
}
