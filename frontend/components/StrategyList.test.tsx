import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StrategyList from './StrategyList';

describe('StrategyList', () => {
  it('narrows the opportunity rail when the risk stance moves to conservative', () => {
    render(React.createElement(StrategyList));

    expect(screen.getByText('Stable LP Farming')).toBeInTheDocument();
    expect(screen.getByText('Warm the mix slightly. Keep stable sleeves leading while allowing selective upside.')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'Risk stance' }), {
      target: { value: '0' },
    });

    expect(screen.getByText('Blue-first view. Keep the rail limited to lower-volatility sleeves.')).toBeInTheDocument();
    expect(screen.queryByText('Stable LP Farming')).not.toBeInTheDocument();
    expect(screen.queryByText('BNB Carry Sleeve')).not.toBeInTheDocument();
  });
});
