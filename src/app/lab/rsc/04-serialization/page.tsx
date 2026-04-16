import { ExerciseLayout } from '../_components/ExerciseLayout'
import { DataDisplay } from './_components/DataDisplay'

export default function SerializationExercise() {
  const now = new Date()

  return (
    <ExerciseLayout
      number="04"
      title="Serialization constraint"
      concept="Props passed from Server to Client Components must be serializable (convertible to JSON). Strings, numbers, booleans, plain objects, arrays, and JSX work. Date objects lose their prototype (become strings). Functions, Map, Set, and class instances cannot cross the boundary."
      questions={[
        'What types can be passed from Server to Client Component?',
        "Why can't you pass functions as props across the boundary?",
        'What happens to a Date object when passed to a Client Component?',
      ]}
    >
      <DataDisplay
        stringVal="hello"
        numberVal={42}
        boolVal={true}
        dateVal={now.toISOString()}
        objVal={{ a: 1, b: { c: 2 } }}
        arrayVal={[1, 2, 3]}
        jsxVal={<span className="font-bold text-green-600">I am JSX passed from Server!</span>}
      />

      <div className="mt-4 rounded bg-red-50 p-4 text-sm text-red-800">
        <p className="font-semibold">Cannot cross the boundary (would cause build error):</p>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          <li>{'• functionVal={() => console.log("hi")} — Functions not serializable'}</li>
          <li>{'• mapVal={new Map([["key", "value"]])} — Map not serializable'}</li>
          <li>{'• setVal={new Set([1, 2, 3])} — Set not serializable'}</li>
        </ul>
        <p className="mt-2 text-xs">
          Uncomment these in the source code to see the actual error message.
        </p>
      </div>
    </ExerciseLayout>
  )
}
