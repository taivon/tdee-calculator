import type { CalculatorInput, CalculatorResult } from '../calculator/types';
import { renderFormulaTable } from './results-panel';

/** Controls returned by {@link renderAdvancedPanel}. */
export interface AdvancedPanelControls {
  /** Mount point for the formula comparison table (updated externally). */
  formulaTableMount: HTMLElement;
}

/**
 * Renders the collapsible advanced options panel.
 * @param mount - Container below the primary form.
 * @param input - Shared mutable calculator state.
 * @param onChange - Called when any advanced field changes.
 */
export function renderAdvancedPanel(
  mount: HTMLElement,
  input: CalculatorInput,
  onChange: (input: CalculatorInput) => void,
): AdvancedPanelControls {
  mount.innerHTML = `
    <details class="advanced-panel">
      <summary class="advanced-panel__summary">Advanced options</summary>
      <div class="advanced-panel__body">
        <div class="form-field">
          <label for="bodyFatPercent">Body fat % <span class="optional">(optional)</span></label>
          <input id="bodyFatPercent" type="number" inputmode="decimal" min="3" max="60" step="0.1" placeholder="e.g. 15" value="${input.bodyFatPercent}" />
          <p class="field-hint">When provided, Katch-McArdle formula is used automatically.</p>
          <p class="validation-hint" data-error-for="bodyFatPercent" hidden></p>
        </div>

        <div class="form-field">
          <label for="cutOffset">Weight loss deficit (kcal/day)</label>
          <input id="cutOffset" type="range" min="100" max="1000" step="50" value="${input.cutOffset}" />
          <output id="cutOffsetValue">${input.cutOffset}</output> kcal below TDEE
        </div>

        <div class="form-field">
          <label for="bulkOffset">Muscle gain surplus (kcal/day)</label>
          <input id="bulkOffset" type="range" min="100" max="1000" step="50" value="${input.bulkOffset}" />
          <output id="bulkOffsetValue">${input.bulkOffset}</output> kcal above TDEE
        </div>

        <div class="form-field">
          <label class="checkbox-label">
            <input id="useCustomMacros" type="checkbox" ${input.useCustomMacros ? 'checked' : ''} />
            Custom macro ratios
          </label>
        </div>

        <div class="macro-sliders" id="macro-sliders" ${input.useCustomMacros ? '' : 'hidden'}>
          <div class="form-field">
            <label for="proteinPercent">Protein %</label>
            <input id="proteinPercent" type="range" min="10" max="50" step="1" value="${input.proteinPercent}" />
            <output id="proteinPercentValue">${input.proteinPercent}</output>%
          </div>
          <div class="form-field">
            <label for="fatPercent">Fat %</label>
            <input id="fatPercent" type="range" min="10" max="50" step="1" value="${input.fatPercent}" />
            <output id="fatPercentValue">${input.fatPercent}</output>%
          </div>
          <div class="form-field">
            <label for="carbPercent">Carbs %</label>
            <input id="carbPercent" type="range" min="10" max="70" step="1" value="${input.carbPercent}" />
            <output id="carbPercentValue">${input.carbPercent}</output>%
          </div>
          <p class="macro-sum" id="macro-sum">Total: ${input.proteinPercent + input.fatPercent + input.carbPercent}%</p>
        </div>

        <div class="form-field">
          <h3 class="advanced-heading">Formula comparison</h3>
          <div id="formula-table"></div>
        </div>
      </div>
    </details>
  `;

  const panel = mount.querySelector<HTMLDetailsElement>('.advanced-panel')!;
  const formulaTableMount = mount.querySelector<HTMLElement>('#formula-table')!;

  const readAdvanced = (): void => {
    input.bodyFatPercent = panel.querySelector<HTMLInputElement>('#bodyFatPercent')!.value;
    input.cutOffset = Number(panel.querySelector<HTMLInputElement>('#cutOffset')!.value);
    input.bulkOffset = Number(panel.querySelector<HTMLInputElement>('#bulkOffset')!.value);
    input.useCustomMacros = panel.querySelector<HTMLInputElement>('#useCustomMacros')!.checked;
    input.proteinPercent = Number(panel.querySelector<HTMLInputElement>('#proteinPercent')!.value);
    input.fatPercent = Number(panel.querySelector<HTMLInputElement>('#fatPercent')!.value);
    input.carbPercent = Number(panel.querySelector<HTMLInputElement>('#carbPercent')!.value);
  };

  const updateOutputs = (): void => {
    panel.querySelector('#cutOffsetValue')!.textContent = String(input.cutOffset);
    panel.querySelector('#bulkOffsetValue')!.textContent = String(input.bulkOffset);
    panel.querySelector('#proteinPercentValue')!.textContent = String(input.proteinPercent);
    panel.querySelector('#fatPercentValue')!.textContent = String(input.fatPercent);
    panel.querySelector('#carbPercentValue')!.textContent = String(input.carbPercent);
    const sum = input.proteinPercent + input.fatPercent + input.carbPercent;
    const sumEl = panel.querySelector<HTMLElement>('#macro-sum')!;
    sumEl.textContent = `Total: ${sum}%`;
    sumEl.classList.toggle('macro-sum--invalid', sum !== 100);
  };

  const emit = (): void => {
    readAdvanced();
    updateOutputs();
    panel.querySelector<HTMLElement>('#macro-sliders')!.hidden = !input.useCustomMacros;
    onChange(input);
  };

  panel.addEventListener('input', emit);
  panel.addEventListener('change', emit);

  return { formulaTableMount };
}

/**
 * Updates advanced panel validation hints and formula table.
 * @param mount - Advanced panel container.
 * @param result - Latest calculator result.
 * @param errors - Field-level validation messages.
 */
export function updateAdvancedPanel(
  mount: HTMLElement,
  result: CalculatorResult | null,
  errors: Partial<Record<keyof CalculatorInput, string>>,
): void {
  const errorEl = mount.querySelector<HTMLElement>('[data-error-for="bodyFatPercent"]');
  if (errorEl) {
    const message = errors.bodyFatPercent;
    errorEl.textContent = message ?? '';
    errorEl.hidden = !message;
  }

  const formulaTable = mount.querySelector<HTMLElement>('#formula-table');
  if (formulaTable) {
    renderFormulaTable(formulaTable, result);
  }
}
