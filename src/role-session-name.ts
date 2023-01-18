// AWS role-session-name constrains:
// allowed regex:
export const valid_regex = /[\w+=,.@-]*/
// max lenght: 64

export const invalid_regex = /[^\w+=,.@-]/g
export const replace_symbol = '-'

export function roleSessionName(full_name: string, runId: number): string {
  if (full_name == '') {
    return ''
  }

  const full_name_splitted = full_name.split('/', 2)
  var organization = full_name_splitted[0]
  var repository = full_name_splitted[1]

  organization = sanityze(organization, invalid_regex)
  organization = deduplicate(organization, replace_symbol)

  repository = sanityze(repository, invalid_regex)
  repository = deduplicate(repository, replace_symbol)

  while (combineLength(organization, repository, runId) > 64) {
    if (!organization.includes('..')) {
      organization = cutTail(organization, 64 - combineLength(organization, repository, runId))
      continue
    }

    if (!repository.includes('..')) {
      repository = cut(repository, 64 - combineLength(organization, repository, runId))
    } else {
      throw new Error("Couldn't truncate input to fulfill required 64 symbols")
    }
  }

  return Array(organization, repository, runId.toString()).join(',')
}

export function sanityze(input: string, regex: RegExp): string {
  if (input == '') {
    return ''
  }
  return input.replace(regex, replace_symbol)
}

export function deduplicate(input: string, findReplace: string): string {
  if (input == '') {
    return ''
  }
  if (findReplace == '') {
    return input
  }
  return input.replace(new RegExp(findReplace+'+', 'g'), findReplace)
}

export function combineLength(org: string, repo: string, run: number) {
  return Array(org, repo, run.toString()).join(',').length
}

export function cutTail(input: string, goal: number): string {
  if (goal >= 0) {
    return input
  }
  if (input.length < 6) {
    return input
  }
  var result = input
  var input_lenght = input.length
  var cut = 2
  var cut_max = Math.ceil(input_lenght / 2)

  while (cut < cut_max) {
    result = input.substring(0, input_lenght - cut)
    if (result.length < input_lenght + goal) {
      break
    } else {
      cut += 1
    }
  }

  result = result.substring(0, result.length - 1) + '..'
  return result
}

export function cut(input: string, goal: number): string {
  if (goal >= 0) {
    return input
  }
  if (input.length < 7) {
    return input
  }
  var result = input
  var input_lenght = input.length
  var cut = 3
  var cut_max = Math.floor(input_lenght / 2)

  while (cut < cut_max) {
    result = input.substring(0, Math.floor(input_lenght / 2) - Math.floor(cut/2)) + input.substring(Math.floor(input_lenght / 2) + Math.floor(cut/2), input_lenght)
    if (result.length <= input_lenght + goal) {
      break
    } else {
      cut += 1
    }
  }

  result = result.substring(0, Math.floor(result.length / 2) - 1) + '..' + result.substring(Math.ceil(result.length / 2) + 1, result.length)
  return result
}
