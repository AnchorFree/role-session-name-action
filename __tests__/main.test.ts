import {roleSessionName} from '../src/role-session-name'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

test('return empty string if no input data', async () => {
  var output = roleSessionName('')
  expect(output).toBe("")
})
