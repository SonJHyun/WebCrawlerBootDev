const { test, expect } = require('@jest/globals')
const { sortPages } = require('./report.js')

test('sortPages', () => {
    const input = {
        'https://wagslane.dev' : 3,
        'https://wagslane.dev/path' : 1
    }
    const actual = sortPages(input)
    const expected = [
        ['https://wagslane.dev', 3], 
        ['https://wagslane.dev/path', 1]
    ]
    expect(actual).toEqual(expected)
  })
  