import { ACTIVITY_LEVELS } from '../calculator/activity';
import type { CalculatorInput, Sex, UnitSystem } from '../calculator/types';

/** Default form state for a new calculator session. */
export function createDefaultInput(): CalculatorInput {
  return {
    sex: 'male',
    age: '',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    bodyFatPercent: '',
    unitSystem: 'metric',
    formula: 'mifflin_st_jeor',
    cutOffset: 500,
    bulkOffset: 300,
    proteinPercent: 30,
    fatPercent: 25,
    carbPercent: 45,
    useCustomMacros: false,
  };
}

/** Height/weight labels and placeholders for the active unit system. */
export interface UnitLabels {
  /** Label for the height field. */
  heightLabel: string;
  /** Placeholder hint for height input. */
  heightPlaceholder: string;
  /** Label for the weight field. */
  weightLabel: string;
  /** Placeholder hint for weight input. */
  weightPlaceholder: string;
}

/**
 * Returns display labels for height and weight fields.
 * @param unitSystem - Metric (cm/kg) or imperial (in/lbs).
 */
export function getUnitLabels(unitSystem: UnitSystem): UnitLabels {
  return unitSystem === 'metric'
    ? {
        heightLabel: 'Height (cm)',
        heightPlaceholder: 'e.g. 180',
        weightLabel: 'Weight (kg)',
        weightPlaceholder: 'e.g. 80',
      }
    : {
        heightLabel: 'Height (inches)',
        heightPlaceholder: 'e.g. 70',
        weightLabel: 'Weight (lbs)',
        weightPlaceholder: 'e.g. 180',
      };
}

/** Controls returned by {@link renderCalculatorForm}. */
export interface CalculatorFormControls {
  /** Reads the latest form state from DOM inputs. */
  getInput: () => CalculatorInput;
  /** Updates inline validation hints under fields. */
  setFieldErrors: (errors: Partial<Record<keyof CalculatorInput, string>>) => void;
  /** Refreshes height/weight labels when the unit system changes. */
  updateUnitLabels: (unitSystem: UnitSystem) => void;
}

/**
 * Renders the primary calculator inputs and wires change events.
 * @param mount - Container element for the form column.
 * @param input - Initial calculator state.
 * @param onChange - Called whenever any field changes.
 */
export function renderCalculatorForm(
  mount: HTMLElement,
  input: CalculatorInput,
  onChange: (input: CalculatorInput) => void,
): CalculatorFormControls {
  const labels = getUnitLabels(input.unitSystem);

  mount.innerHTML = `
    <form class="calculator-form" id="tdee-form" novalidate>
      <fieldset class="form-field">
        <legend>Sex</legend>
        <div class="radio-group">
          <label><input type="radio" name="sex" value="male" ${input.sex === 'male' ? 'checked' : ''} /> Male</label>
          <label><input type="radio" name="sex" value="female" ${input.sex === 'female' ? 'checked' : ''} /> Female</label>
        </div>
      </fieldset>

      <div class="form-field">
        <label for="age">Age (years)</label>
        <input id="age" name="age" type="number" inputmode="numeric" min="15" max="80" placeholder="e.g. 30" value="${input.age}" />
        <p class="validation-hint" data-error-for="age" hidden></p>
      </div>

      <div class="form-field">
        <label for="height" id="height-label">${labels.heightLabel}</label>
        <input id="height" name="height" type="number" inputmode="decimal" placeholder="${labels.heightPlaceholder}" value="${input.height}" />
        <p class="validation-hint" data-error-for="height" hidden></p>
      </div>

      <div class="form-field">
        <label for="weight" id="weight-label">${labels.weightLabel}</label>
        <input id="weight" name="weight" type="number" inputmode="decimal" placeholder="${labels.weightPlaceholder}" value="${input.weight}" />
        <p class="validation-hint" data-error-for="weight" hidden></p>
      </div>

      <div class="form-field">
        <label for="activityLevel">Activity level</label>
        <select id="activityLevel" name="activityLevel">
          ${ACTIVITY_LEVELS.map(
            (level) =>
              `<option value="${level.id}" ${input.activityLevel === level.id ? 'selected' : ''}>${level.label} — ${level.description}</option>`,
          ).join('')}
        </select>
      </div>
    </form>
  `;

  const form = mount.querySelector<HTMLFormElement>('#tdee-form')!;

  const readInput = (): CalculatorInput => {
    const sex = form.querySelector<HTMLInputElement>('input[name="sex"]:checked')!.value as Sex;
    return {
      sex,
      age: form.querySelector<HTMLInputElement>('#age')!.value,
      height: form.querySelector<HTMLInputElement>('#height')!.value,
      weight: form.querySelector<HTMLInputElement>('#weight')!.value,
      activityLevel: form.querySelector<HTMLSelectElement>('#activityLevel')!.value as CalculatorInput['activityLevel'],
      bodyFatPercent: input.bodyFatPercent,
      unitSystem: input.unitSystem,
      formula: input.formula,
      cutOffset: input.cutOffset,
      bulkOffset: input.bulkOffset,
      proteinPercent: input.proteinPercent,
      fatPercent: input.fatPercent,
      carbPercent: input.carbPercent,
      useCustomMacros: input.useCustomMacros,
    };
  };

  const emitChange = (): void => {
    Object.assign(input, readInput());
    onChange(input);
  };

  form.addEventListener('input', emitChange);
  form.addEventListener('change', emitChange);

  return {
    getInput: () => {
      Object.assign(input, readInput());
      return input;
    },
    setFieldErrors: (errors) => {
      mount.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
        const key = el.dataset.errorFor as keyof CalculatorInput;
        const message = errors[key];
        if (message) {
          el.textContent = message;
          el.hidden = false;
        } else {
          el.textContent = '';
          el.hidden = true;
        }
      });
    },
    updateUnitLabels: (unitSystem) => {
      const next = getUnitLabels(unitSystem);
      mount.querySelector<HTMLLabelElement>('#height-label')!.textContent = next.heightLabel;
      mount.querySelector<HTMLInputElement>('#height')!.placeholder = next.heightPlaceholder;
      mount.querySelector<HTMLLabelElement>('#weight-label')!.textContent = next.weightLabel;
      mount.querySelector<HTMLInputElement>('#weight')!.placeholder = next.weightPlaceholder;
    },
  };
}
