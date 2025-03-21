import { MutationKey } from '@tanstack/react-query'

function formMutationKeyFn(baseEntity: string) {
  return function mutationKeyFn(additionalKeys: MutationKey = []) {
    return [{ ...mutationKeys.all, baseEntity }, ...additionalKeys]
  }
}

export const mutationKeys = {
  all: { baseScope: 'nuwa' },
  createAgent: formMutationKeyFn('create_agent'),
}
