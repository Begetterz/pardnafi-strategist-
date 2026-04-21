import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StrategyList from './StrategyList';

describe('StrategyList', () => {
  it('narrows the opportunity rail when the risk stance moves to conservative', () => {
    render(React.createElement(StrategyList));

    expect(screen.getByText('Stable LP Farming')).toBeInTheDocument();
    expect(screen.getByText('Warm the mix slightly. Keep stable sleeves leading while allowing selective upside.')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'Risk' }), {
      target: { value: '0' },
    });

    expect(screen.getByText('Blue-first view. Keep the rail limited to lower-volatility sleeves.')).toBeInTheDocument();
    expect(screen.queryByText('Stable LP Farming')).not.toBeInTheDocument();
    expect(screen.queryByText('BNB Carry Sleeve')).not.toBeInTheDocument();
  });

  it('filters the rail to opBNB when the chain slider moves to opBNB only', () => {
    render(React.createElement(StrategyList));

    expect(screen.getByText('Stable Lending Strategy')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'Chain' }), {
      target: { value: '2' },
    });

    expect(screen.getByText('Focus the rail on opBNB routes when speed and lower-cost sleeves matter.')).toBeInTheDocument();
    expect(screen.getByText('Stable LP Farming')).toBeInTheDocument();
    expect(screen.queryByText('Stable Lending Strategy')).not.toBeInTheDocument();
  });
});
