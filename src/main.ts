import * as core from '@actions/core'
import * as github from '@actions/github'
import {roleSessionName} from './role-session-name'

async function run(): Promise<void> {
  try {
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    core.debug(`The event payload: ${payload}`)

    if (
      !(
        github.context.payload.repository &&
        github.context.payload.repository.full_name
      )
    ) {
      throw new Error(
        "Payload from GitHub didn't contains required fields: repository.full_name"
      )
    }
    core.setOutput(
      'role-session-name',
      roleSessionName(
        github.context.payload.repository?.full_name,
        github.context.runId
      )
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
