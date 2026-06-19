import { detectDefaultUnitSystem, convertHeightValue, convertWeightValue } from '../calculator/locale';
import { ACTIVITY_LEVELS } from '../calculator/activity';
import { feetInchesToInches, inchesToFeetInches } from '../calculator/units';
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
    unitSystem: detectDefaultUnitSystem(),
    formula: 'mifflin_st_jeor',
    cutOffset: 500,
    bulkOffset: 300,
    proteinPercent: 30,
    fatPercent: 25,
    carbPercent: 45,
    useCustomMacros: false,
  };
}

/** Controls returned by {@link renderCalculatorForm}. */
export interface CalculatorFormControls {
  /** Reads the latest form state from DOM inputs. */
  getInput: () => CalculatorInput;
  /** Updates inline validation hints under fields. */
  setFieldErrors: (errors: Partial<Record<keyof CalculatorInput, string>>) => void;
}

/** Imperial height bounds used by ft/in selectors (4'0" – 8'2"). */
const IMPERIAL_FEET_MIN = 4;
const IMPERIAL_FEET_MAX = 8;

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
  const render = (): void => {
    mount.innerHTML = `
      <form class="calculator-form" id="tdee-form" novalidate>
        <div class="unit-toggle ${input.unitSystem === 'imperial' ? 'unit-toggle--imperial' : ''}" role="group" aria-label="Unit system">
          <span class="unit-toggle__indicator" aria-hidden="true"></span>
          <button type="button" class="unit-toggle__btn" data-unit="metric" aria-pressed="${input.unitSystem === 'metric'}">
            <span class="unit-toggle__label">Metric</span>
            <span class="unit-toggle__hint">cm · kg</span>
          </button>
          <button type="button" class="unit-toggle__btn" data-unit="imperial" aria-pressed="${input.unitSystem === 'imperial'}">
            <span class="unit-toggle__label">Imperial</span>
            <span class="unit-toggle__hint">ft · lbs</span>
          </button>
        </div>

        <fieldset class="form-field">
          <legend>Sex</legend>
          <div class="segmented segmented--sex">
            <label class="segmented__option ${input.sex === 'male' ? 'segmented__option--active' : ''}">
              <input type="radio" name="sex" value="male" ${input.sex === 'male' ? 'checked' : ''} />
              Male
            </label>
            <label class="segmented__option ${input.sex === 'female' ? 'segmented__option--active' : ''}">
              <input type="radio" name="sex" value="female" ${input.sex === 'female' ? 'checked' : ''} />
              Female
            </label>
          </div>
        </fieldset>

        <div class="form-field">
          <label for="age">Age</label>
          <div class="input-group">
            <input id="age" name="age" type="number" inputmode="numeric" min="15" max="80" placeholder="30" value="${input.age}" />
            <span class="input-group__suffix">years</span>
          </div>
          <p class="validation-hint" data-error-for="age" hidden></p>
        </div>

        <div id="height-fields"></div>

        <div class="form-field">
          <label for="weight">Weight</label>
          <div class="input-group">
            <input id="weight" name="weight" type="number" inputmode="decimal" placeholder="${input.unitSystem === 'metric' ? '80' : '180'}" value="${input.weight}" />
            <span class="input-group__suffix" id="weight-suffix">${input.unitSystem === 'metric' ? 'kg' : 'lbs'}</span>
          </div>
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

    renderHeightFields(mount, input);
    wireForm(mount, input, onChange, render);
  };

  render();

  return {
    getInput: () => readInput(mount, input),
    setFieldErrors: (errors) => setFieldErrors(mount, errors),
  };
}

/**
 * Renders metric or imperial height inputs inside the form.
 * @param mount - Form column container.
 * @param input - Shared calculator state.
 */
function renderHeightFields(mount: HTMLElement, input: CalculatorInput): void {
  const container = mount.querySelector<HTMLElement>('#height-fields')!;

  if (input.unitSystem === 'metric') {
    container.innerHTML = `
      <div class="form-field">
        <label for="height">Height</label>
        <div class="input-group">
          <input id="height" name="height" type="number" inputmode="decimal" placeholder="180" value="${input.height}" />
          <span class="input-group__suffix">cm</span>
        </div>
        <p class="validation-hint" data-error-for="height" hidden></p>
      </div>
    `;
    return;
  }

  const totalInches = Number(input.height);
  const hasHeight = input.height.trim() !== '' && Number.isFinite(totalInches);
  const { feet, inches } = hasHeight ? inchesToFeetInches(totalInches) : { feet: -1, inches: -1 };

  const feetOptions = [
    `<option value="" ${!hasHeight ? 'selected' : ''} disabled>Ft</option>`,
    ...Array.from({ length: IMPERIAL_FEET_MAX - IMPERIAL_FEET_MIN + 1 }, (_, index) => {
      const value = IMPERIAL_FEET_MIN + index;
      const selected = hasHeight && value === feet ? 'selected' : '';
      return `<option value="${value}" ${selected}>${value} ft</option>`;
    }),
  ].join('');

  const inchOptions = [
    `<option value="" ${!hasHeight ? 'selected' : ''} disabled>In</option>`,
    ...Array.from({ length: 12 }, (_, index) => {
      const selected = hasHeight && index === inches ? 'selected' : '';
      return `<option value="${index}" ${selected}>${index} in</option>`;
    }),
  ].join('');

  container.innerHTML = `
    <div class="form-field">
      <label>Height</label>
      <div class="height-split">
        <select id="height-feet" aria-label="Feet">${feetOptions}</select>
        <select id="height-inches" aria-label="Inches">${inchOptions}</select>
      </div>
      <p class="validation-hint" data-error-for="height" hidden></p>
    </div>
  `;
}

/**
 * Reads height from the active unit inputs into total inches or centimeters string.
 * @param form - Calculator form element.
 * @param unitSystem - Active unit system.
 */
function readHeight(form: HTMLFormElement, unitSystem: UnitSystem): string {
  if (unitSystem === 'metric') {
    return form.querySelector<HTMLInputElement>('#height')?.value ?? '';
  }

  const feetRaw = form.querySelector<HTMLSelectElement>('#height-feet')?.value ?? '';
  const inchesRaw = form.querySelector<HTMLSelectElement>('#height-inches')?.value ?? '';
  if (feetRaw === '' || inchesRaw === '') {
    return '';
  }

  const feet = Number(feetRaw);
  const inches = Number(inchesRaw);
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) {
    return '';
  }

  return String(feetInchesToInches(feet, inches));
}

/**
 * Reads all primary form values into shared calculator state shape.
 * @param mount - Form column container.
 * @param input - Shared calculator state for advanced fields.
 */
function readInput(mount: HTMLElement, input: CalculatorInput): CalculatorInput {
  const form = mount.querySelector<HTMLFormElement>('#tdee-form')!;
  const sex = form.querySelector<HTMLInputElement>('input[name="sex"]:checked')!.value as Sex;

  return {
    sex,
    age: form.querySelector<HTMLInputElement>('#age')!.value,
    height: readHeight(form, input.unitSystem),
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
}

/**
 * Applies validation messages under matching fields.
 * @param mount - Form column container.
 * @param errors - Field-level validation messages.
 */
function setFieldErrors(
  mount: HTMLElement,
  errors: Partial<Record<keyof CalculatorInput, string>>,
): void {
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
}

/**
 * Switches unit system and converts existing height/weight values when possible.
 * @param input - Shared calculator state.
 * @param nextUnit - Target unit system.
 */
function switchUnitSystem(input: CalculatorInput, nextUnit: UnitSystem): void {
  if (input.unitSystem === nextUnit) {
    return;
  }

  input.height = convertHeightValue(input.height, input.unitSystem, nextUnit);
  input.weight = convertWeightValue(input.weight, input.unitSystem, nextUnit);
  input.unitSystem = nextUnit;
}

/**
 * Wires form events after each render.
 * @param mount - Form column container.
 * @param input - Shared calculator state.
 * @param onChange - Change callback.
 * @param render - Re-render function for unit toggles.
 */
function wireForm(
  mount: HTMLElement,
  input: CalculatorInput,
  onChange: (input: CalculatorInput) => void,
  render: () => void,
): void {
  const form = mount.querySelector<HTMLFormElement>('#tdee-form')!;

  const emitChange = (): void => {
    Object.assign(input, readInput(mount, input));
    onChange(input);
  };

  form.addEventListener('input', emitChange);
  form.addEventListener('change', emitChange);

  mount.querySelectorAll<HTMLButtonElement>('.unit-toggle__btn').forEach((button) => {
    button.addEventListener('click', () => {
      const nextUnit = button.dataset.unit as UnitSystem;
      switchUnitSystem(input, nextUnit);
      render();
      Object.assign(input, readInput(mount, input));
      onChange(input);
    });
  });

  form.querySelectorAll<HTMLInputElement>('input[name="sex"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      form.querySelectorAll('.segmented__option').forEach((option) => {
        option.classList.toggle(
          'segmented__option--active',
          option.querySelector('input') === radio && radio.checked,
        );
      });
    });
  });
}