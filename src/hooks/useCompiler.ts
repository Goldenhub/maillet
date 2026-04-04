import { useState, useCallback, useEffect } from 'react';
import type { CompileResult, Warning } from '@/types';
import { compileEmail } from '@/utils/compiler/compileEmail';
import { useDebounce } from './useDebounce';
import { DEBOUNCE_MS } from '@/utils/constants';

interface UseCompilerReturn {
  output: string;
  warnings: Warning[];
  isCompiling: boolean;
  compile: () => void;
}

export function useCompiler(input: string, debounceMs: number = DEBOUNCE_MS): UseCompilerReturn {
  const [output, setOutput] = useState<string>('');
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  const runCompile = useCallback(() => {
    setIsCompiling(true);
    const result: CompileResult = compileEmail(input);
    setOutput(result.html);
    setWarnings(result.warnings);
    setIsCompiling(false);
  }, [input]);

  const [debouncedCompile] = useDebounce(runCompile, debounceMs);

  useEffect(() => {
    debouncedCompile();
  }, [input, debouncedCompile]);

  return { output, warnings, isCompiling, compile: runCompile };
}
