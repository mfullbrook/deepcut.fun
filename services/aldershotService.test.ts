import { parseConditions } from './aldershotService';

describe('parseConditions', () => {
  test('handles "8am to 4pm" format correctly', () => {
    const result = parseConditions(false, '8am to 4pm');
    expect(result).toEqual({
      raw: '8am to 4pm',
      opensAt: '4pm',
      closesAt: '8am'
    });
  })

  test('handles "from 8am, to 4.30pm" format correctly', () => {
    const result = parseConditions(false, 'from 8am, to 4.30pm');
    expect(result).toEqual({
      raw: 'from 8am, to 4.30pm',
      opensAt: '4.30pm',
      closesAt: '8am'
    });
  })

  test('handles "until X" format correctly', () => {
    let result = parseConditions(false, 'until 4.30pm');
    expect(result).toEqual({
      raw: 'until 4.30pm',
      opensAt: '4.30pm',
      closesAt: null
    });

    result = parseConditions(false, 'until 4pm');
    expect(result).toEqual({
      raw: 'until 4pm',
      opensAt: '4pm',
      closesAt: null
    });
  });

  test('handles "Day & night training" format correctly', () => {
    const result = parseConditions(false, 'Day & night training');
    expect(result).toEqual({
      raw: 'Day & night training',
      opensAt: null,
      closesAt: null
    });
  });

  test('handles "from X, Day & night training" format correctly', () => {
    const result = parseConditions(false, 'from 8am, Day & night training');
    expect(result).toEqual({
      raw: 'from 8am, Day & night training',
      opensAt: null,
      closesAt: '8am'
    });
  });

  test('throws error when isOpen is true with conditions', () => {
    expect(() => {
      parseConditions(true, 'until 4.30pm');
    }).toThrow('Edge case found, isOpen=true with conditions');
  });

  test('handles empty input correctly', () => {
    const result = parseConditions(false, '');
    expect(result).toEqual({
      raw: '',
      opensAt: null,
      closesAt: null
    });
  });
}); 