import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DeltaBadge } from './DeltaBadge';

describe('DeltaBadge component', () => {
  it('renders PR badge when isPR is true', () => {
    render(<DeltaBadge currentWeightKg={100} currentReps={10} isPR={true} />);
    expect(screen.getByText('PR!')).toBeTruthy();
  });

  it('renders weight increase badge when weight is higher', () => {
    render(
      <DeltaBadge
        currentWeightKg={82.5}
        currentReps={10}
        previousWeightKg={80}
        previousReps={10}
      />
    );
    expect(screen.getByText('+2.5 kg')).toBeTruthy();
  });

  it('renders rep increase badge when reps are higher', () => {
    render(
      <DeltaBadge
        currentWeightKg={80}
        currentReps={10}
        previousWeightKg={80}
        previousReps={8}
      />
    );
    expect(screen.getByText('+2 reps')).toBeTruthy();
  });
});
