import {roleSessionName, cut, cutTail, deduplicate, sanityze} from '../src/role-session-name'
import {expect, test} from '@jest/globals'

test.concurrent.each([
  ['', 1, ''],
  ['Organization/Repository', 1, 'Organization,Repository,1'],
  ['Organization/Repository', 1234567890, 'Organization,Repository,1234567890'],
  ['OrganizationOrganization/Repository', 1, 'OrganizationOrganization,Repository,1'],
  ['OrganizationOrganization/Repository', 1234567890, 'OrganizationOrganization,Repository,1234567890'],
  ['OrganizationOrganizationOrganization/Repository', 1, 'OrganizationOrganizationOrganization,Repository,1'],
  ['OrganizationOrganizationOrganization/Repository', 1234567890, 'OrganizationOrganizationOrganization,Repository,1234567890'],
  ['OrganizationOrganizationOrganization/RepositoryRepository', 1, 'OrganizationOrganizationOrganization,RepositoryRepository,1'],
  ['OrganizationOrganizationOrganization/RepositoryRepository', 1234567890, 'OrganizationOrganizationOrgani..,RepositoryRepository,1234567890'],
  ['OrganizationOrganizationOrganization/RepositoryRepositoryRepositoryRepositoryRepositoryRepository', 1, 'OrganizationOrgani..,RepositoryRepositor..epositoryRepository,1'],
  ['OrganizationOrganizationOrganization/RepositoryRepositoryRepositoryRepositoryRepositoryRepository', 1234567890, 'OrganizationOrgani..,RepositoryRepos..itoryRepository,1234567890'],
])('roleSessionName %s $i', async (name, runId, expected) => {
  expect(roleSessionName(name, runId)).toBe(expected)
})

test.concurrent.each([
  ['a', /a/g, '-'],
  ['a', /b/g, 'a'],
  ['aa', /a/g, '--'],
  ['aa', /b/g, 'aa'],
  ['aba', /a/g, '-b-'],
  ['aba', /b/g, 'a-a'],
  ['aabb', /a/g, '--bb'],
  ['aabb', /b/g, 'aa--'],
])('sanituze %s %s', async (input, regex, expected) => {
  expect(sanityze(input, regex)).toBe(expected)
})

test.concurrent.each([
  ['', '', ''],
  ['a', '', 'a'],
  ['a', 'a', 'a'],
  ['a', 'b', 'a'],
  ['aa', '', 'aa'],
  ['aa', 'a', 'a'],
  ['aa', 'b', 'aa'],
  ['aaa', 'a', 'a'],
  ['aaa', 'b', 'aaa'],
  ['aaaba', 'a', 'aba'],
  ['aaaba', 'b', 'aaaba'],
  ['aaabaa', 'a', 'aba'],
  ['aaabaa', 'b', 'aaabaa'],
  ['aaabaaa', 'a', 'aba'],
  ['aaabaaa', 'b', 'aaabaaa'],
  ['aaabbaaa', 'a', 'abba'],
  ['aaabbaaa', 'b', 'aaabaaa'],
  ['aaabbbaaab', 'a', 'abbbab'],
  ['aaabbbaaab', 'b', 'aaabaaab'],
])('deduplicate %s %s', async (input, deficit, expected) => {
  expect(deduplicate(input, deficit)).toBe(expected)
})

test('sannitize + deduplicate', () => {
  expect(roleSessionName('!#$%^&*()_Organ!#$%ization^&*()_/Repository', 1)).toBe('-_Organ-ization-_,Repository,1')
})

test.concurrent.each([
  ['',                 Number.MIN_SAFE_INTEGER, ''],
  ['a',                Number.MIN_SAFE_INTEGER, 'a'],
  ['ab',               Number.MIN_SAFE_INTEGER, 'ab'],
  ['abc',              Number.MIN_SAFE_INTEGER, 'abc'],
  ['abcd',             Number.MIN_SAFE_INTEGER, 'abcd'],
  ['abcde',            Number.MIN_SAFE_INTEGER, 'abcde'],
  ['abcdef',           Number.MIN_SAFE_INTEGER, 'abc..'],
  ['abcdefg',          Number.MIN_SAFE_INTEGER, 'abc..'],
  ['abcdefgh',         Number.MIN_SAFE_INTEGER, 'abcd..'],
  ['abcdefghi',        Number.MIN_SAFE_INTEGER, 'abcd..'],
  ['abcdefghij',       Number.MIN_SAFE_INTEGER, 'abcde..'],
  ['abcdefghijk',      Number.MIN_SAFE_INTEGER, 'abcde..'],
  ['abcdefghijkl',     Number.MIN_SAFE_INTEGER, 'abcdef..'],
  ['abcdefghijklm',    Number.MIN_SAFE_INTEGER, 'abcdef..'],
  ['abcdefghijklmn',   Number.MIN_SAFE_INTEGER, 'abcdefg..'],
  ['abcdefghijklmno',  Number.MIN_SAFE_INTEGER, 'abcdefg..'],
  ['abcdefghijklmnop', Number.MIN_SAFE_INTEGER, 'abcdefgh..'],
  // ...
  ['abcdefghijklmnop', -6, 'abcdefgh..'],
  ['abcdefghijklmnop', -5, 'abcdefghi..'],
  ['abcdefghijklmnop', -4, 'abcdefghij..'],
  ['abcdefghijklmnop', -3, 'abcdefghijk..'],
  ['abcdefghijklmnop', -2, 'abcdefghijkl..'],
  ['abcdefghijklmnop', -1, 'abcdefghijklm..'],
  ['abcdefghijklmnop',  0, 'abcdefghijklmnop'],
  ['',         0, ''],
  ['a',        0, 'a'],
  ['ab',       0, 'ab'],
  ['abc',      0, 'abc'],
  // ...
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', 0, 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'],
  ['',         Number.MAX_SAFE_INTEGER, ''],
  ['a',        Number.MAX_SAFE_INTEGER, 'a'],
  ['ab',       Number.MAX_SAFE_INTEGER, 'ab'],
  ['abc',      Number.MAX_SAFE_INTEGER, 'abc'],
  // ...
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', Number.MAX_SAFE_INTEGER, 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'],
])('cutTail %s %i', async (input, deficit, expected) => {
  expect(cutTail(input, deficit)).toBe(expected)
})

test.concurrent.each([
  ['',                 Number.MIN_SAFE_INTEGER, ''],
  ['a',                Number.MIN_SAFE_INTEGER, 'a'],
  ['ab',               Number.MIN_SAFE_INTEGER, 'ab'],
  ['abc',              Number.MIN_SAFE_INTEGER, 'abc'],
  ['abcd',             Number.MIN_SAFE_INTEGER, 'abcd'],
  ['abcde',            Number.MIN_SAFE_INTEGER, 'abcde'],
  ['abcdef',           Number.MIN_SAFE_INTEGER, 'abcdef'],
  ['abcdefg',          Number.MIN_SAFE_INTEGER, 'ab..fg'],
  ['abcdefghi',        Number.MIN_SAFE_INTEGER, 'ab..hi'],
  ['abcdefghij',       Number.MIN_SAFE_INTEGER, 'ab..ij'],
  ['abcdefghijk',      Number.MIN_SAFE_INTEGER, 'ab..jk'],
  ['abcdefghijkl',     Number.MIN_SAFE_INTEGER, 'abc..jkl'],
  ['abcdefghijklm',    Number.MIN_SAFE_INTEGER, 'abc..klm'],
  ['abcdefghijklmn',   Number.MIN_SAFE_INTEGER, 'abc..lmn'],
  ['abcdefghijklmno',  Number.MIN_SAFE_INTEGER, 'abc..mno'],
  ['abcdefghijklmnop', Number.MIN_SAFE_INTEGER, 'abcd..mnop'],
  // ...
  ['abcdefghijklmnop', -5, 'abcd..mnop'],
  ['abcdefghijklmnop', -4, 'abcde..lmnop'],
  ['abcdefghijklmnop', -3, 'abcde..lmnop'],
  ['abcdefghijklmnop', -2, 'abcdef..klmnop'],
  ['abcdefghijklmnop', -1, 'abcdef..klmnop'],
  ['abcdefghijklmnop',  0, 'abcdefghijklmnop'],
  ['',         0, ''],
  ['a',        0, 'a'],
  ['ab',       0, 'ab'],
  ['abc',      0, 'abc'],
  // ...
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', 0, 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'],
  ['',         Number.MAX_SAFE_INTEGER, ''],
  ['a',        Number.MAX_SAFE_INTEGER, 'a'],
  ['ab',       Number.MAX_SAFE_INTEGER, 'ab'],
  ['abc',      Number.MAX_SAFE_INTEGER, 'abc'],
  // ...
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz', Number.MAX_SAFE_INTEGER, 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'],
])('cut(%s, %i)', async (a, b, expected) => {
  expect(cut(a, b)).toBe(expected);
});