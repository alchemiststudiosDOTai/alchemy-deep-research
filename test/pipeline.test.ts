import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { deepResearch } from '../src/pipeline';

describe('Deep Research Pipeline', () => {
  it('should research LLM long-term memory', async () => {
    // This test will run a real research process with the specified parameters
    // Note: This is an integration test and will make real API calls
    const result = await deepResearch(
      'How do LLMs handle long-term memory?',
      1, // breadth
      1, // depth
      1, // concurrency
      {
        openaiModel: 'gpt-4o-mini',
        browserModel: 'gpt-4.1-mini'
      }
    );
    
    // Basic validation
    assert.ok(result);
    assert.ok(Array.isArray(result.learnings));
    assert.ok(Array.isArray(result.visited));
    
    // At minimum, we should have some learnings and visited sites
    assert.ok(result.learnings.length > 0, 'Should have at least one learning');
    assert.ok(result.visited.length > 0, 'Should have at least one visited URL');
    
    console.log('Learnings:', result.learnings);
    console.log('Visited URLs:', result.visited);
  });
});
