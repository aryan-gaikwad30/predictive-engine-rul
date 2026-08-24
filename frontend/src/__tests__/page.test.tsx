/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import * as api from '@/lib/api';
import { vi } from 'vitest';

// Mock the API calls
vi.mock('@/lib/api', () => ({
  uploadProfile: vi.fn(),
  startTraining: vi.fn(),
  pollJobStatus: vi.fn(),
  getPredictions: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock Framer Motion's useScroll/useTransform/useInView to avoid infinite animation loops in JSDOM
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useScroll: () => ({ scrollYProgress: { get: () => 0 }, scrollY: { get: () => 0 } }),
    useTransform: () => ({ get: () => 0 }),
    useInView: () => true,
    useReducedMotion: () => false,
  };
});

// Mock Recharts to prevent ResizeObserver/DOM issues in tests
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('Commercial Frontend Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('1. Landing page and navigation render', () => {
    render(<Home />);
    // Navbar
    expect(screen.getByText('PREDICTIVE')).toBeInTheDocument();
    // Hero
    expect(screen.getByText(/Know When/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Your Data/i })).toBeInTheDocument();
    // Storytelling
    expect(screen.getByText(/Every Machine/i)).toBeInTheDocument();
  });

  test('2. Upload section renders and Demo dataset works', async () => {
    render(<Home />);
    expect(screen.getByText(/Bring Your/i)).toBeInTheDocument();
    
    // Simulate demo click
    const demoButton = screen.getByText(/TRY DEMO DATASET/i);
    expect(demoButton).toBeInTheDocument();
    
    // Mock fetch for demo dataset
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['mock,csv,data'], { type: 'text/csv' }))
    });
    
    // Mock the profile response
    vi.mocked(api.uploadProfile).mockResolvedValue({
      row_count: 500,
      column_count: 10,
      columns: ['machine_id', 'time_cycles', 'sensor_1', 'RUL'],
      numeric_columns: ['time_cycles', 'sensor_1', 'RUL'],
      categorical_columns: ['machine_id'],
      entity_candidates: ['machine_id'],
      detected_entity: 'machine_id',
      time_candidates: ['time_cycles'],
      detected_time: 'time_cycles',
      target_candidates: ['RUL'],
      detected_target: 'RUL',
      feature_candidates: ['sensor_1'],
      condition_candidates: [],
      missing_values: {},
      duplicate_count: 0,
      constant_columns: [],
      warnings: []
    });

    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(api.uploadProfile).toHaveBeenCalled();
    });

    // 4. Profile state renders correctly
    expect(screen.getByText(/Dataset Profile/i)).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument(); // rows
    expect(screen.getByText('10')).toBeInTheDocument(); // columns
    
    // 5. Schema config validation
    expect(screen.getByText(/Schema Detected Successfully/i)).toBeInTheDocument();
    
    // 6 & 7. Training Workflow
    vi.mocked(api.startTraining).mockResolvedValue({ job_id: 'job-123', status: 'started' });
    vi.mocked(api.pollJobStatus).mockResolvedValue({ job_id: 'job-123', status: 'completed' });
    vi.mocked(api.getPredictions).mockResolvedValue({
      job_id: 'job-123',
      status: 'completed',
      metrics: {
        RMSE: 12.5,
        MAE: 9.8,
        NASA_score: 1500,
        early_prediction_percentage: 60.5,
        late_prediction_percentage: 10.2,
        mean_signed_error: -2.1,
        maximum_absolute_error: 40.5
      },
      feature_importance: [
        { feature: 'sensor_1', importance: 0.85 }
      ],
      maintenance_metrics: [],
      predictions: [
        { machine_id: 'M1', time_cycles: 1, predicted_rul: 100, actual_rul: 95 }
      ]
    });

    const trainButton = screen.getByRole('button', { name: /Train Model/i });
    fireEvent.click(trainButton);

    await waitFor(() => {
      expect(api.startTraining).toHaveBeenCalled();
      expect(api.getPredictions).toHaveBeenCalledWith('job-123');
    });

    // 8. Results display backend-provided values
    expect(screen.getByText(/Your Machines/i)).toBeInTheDocument();
    expect(screen.getByText('12.50')).toBeInTheDocument(); // RMSE
    expect(screen.getByText('9.80')).toBeInTheDocument(); // MAE
    expect(screen.getByText('1500')).toBeInTheDocument(); // NASA Score
    
    // 9. Maintenance Horizon renders
    expect(screen.getByText(/Maintenance Horizon/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical/i)).toBeInTheDocument();
    expect(screen.getByText('≤30')).toBeInTheDocument();

    // 10. Feature importance renders
    expect(screen.getByText('sensor_1')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
  });

  test('11. API failure displays error', async () => {
    render(<Home />);
    
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['mock'], { type: 'text/csv' }))
    });
    
    vi.mocked(api.uploadProfile).mockRejectedValue(new Error('Backend unavailable'));
    
    const demoButton = screen.getByText(/TRY DEMO DATASET/i);
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getByText('Backend unavailable')).toBeInTheDocument();
    });
  });

  test('12. Ambiguous profile state requires configuration', async () => {
    render(<Home />);
    
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['mock'], { type: 'text/csv' }))
    });
    
    vi.mocked(api.uploadProfile).mockResolvedValue({
      row_count: 100, column_count: 5, columns: ['id1', 'id2', 'time', 'y1', 'y2'],
      numeric_columns: [], categorical_columns: [], entity_candidates: [],
      detected_entity: null, // Null indicates ambiguity
      time_candidates: [], detected_time: null,
      target_candidates: [], detected_target: null,
      feature_candidates: [], condition_candidates: [],
      missing_values: {}, duplicate_count: 0, constant_columns: [], warnings: []
    });

    const demoButton = screen.getByText(/TRY DEMO DATASET/i);
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(screen.getByText(/We Need Your Input/i)).toBeInTheDocument();
    });
    
    // Train button should be disabled due to missing configuration
    const trainButton = screen.getByRole('button', { name: /Train Model/i });
    expect(trainButton).toBeDisabled();
  });
});
