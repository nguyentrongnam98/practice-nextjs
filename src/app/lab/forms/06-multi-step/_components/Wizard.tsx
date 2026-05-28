import { StepOne } from './StepOne'
import { StepTwo } from './StepTwo'
import { StepThree } from './StepThree'
import type { WizardState } from '../_schema'

type Props = { step: string; state: WizardState }

export function Wizard({ step, state }: Props) {
  if (step === 'done') {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
        ✓ Wizard submitted! Check the server terminal for the logged payload. The cookie has been cleared.
      </div>
    )
  }
  if (step === '2') {
    return (
      <StepTwo
        defaultStreet={state.street}
        defaultCity={state.city}
        defaultCountry={state.country}
      />
    )
  }
  if (step === '3') {
    return <StepThree state={state} />
  }
  return <StepOne defaultName={state.name} defaultEmail={state.email} />
}
