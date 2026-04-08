import { describe, it, expect } from 'vitest';
import {
  parseFraction,
  parseQuantity,
  parseIngredientString,
  findRecipeInJsonLd,
  extractJsonLdRecipe,
} from './parsing';

// ===== parseFraction =====

describe('parseFraction', () => {
  it('parses simple fractions', () => {
    expect(parseFraction('1/2')).toBe(0.5);
    expect(parseFraction('1/4')).toBe(0.25);
    expect(parseFraction('3/4')).toBe(0.75);
    expect(parseFraction('2/3')).toBeCloseTo(0.667, 2);
  });

  it('returns null for non-fractions', () => {
    expect(parseFraction('2')).toBeNull();
    expect(parseFraction('abc')).toBeNull();
    expect(parseFraction('')).toBeNull();
  });

  it('returns null for division by zero', () => {
    expect(parseFraction('1/0')).toBeNull();
  });
});

// ===== parseQuantity =====

describe('parseQuantity', () => {
  it('parses whole numbers', () => {
    expect(parseQuantity('2 cups flour')).toEqual([2, 'cups flour']);
  });

  it('parses decimal numbers', () => {
    expect(parseQuantity('1.5 cups flour')).toEqual([1.5, 'cups flour']);
  });

  it('parses fractions', () => {
    expect(parseQuantity('1/2 cup sugar')).toEqual([0.5, 'cup sugar']);
  });

  it('parses mixed numbers', () => {
    expect(parseQuantity('1 1/2 cups flour')).toEqual([1.5, 'cups flour']);
    expect(parseQuantity('2 3/4 oz butter')).toEqual([2.75, 'oz butter']);
  });

  it('handles unicode fractions', () => {
    const result = parseQuantity('1½ cups flour');
    expect(result).not.toBeNull();
    expect(result![0]).toBe(1.5);
  });

  it('returns null for no quantity', () => {
    expect(parseQuantity('salt to taste')).toBeNull();
  });
});

// ===== parseIngredientString =====

describe('parseIngredientString', () => {
  it('parses a simple ingredient', () => {
    const result = parseIngredientString('2 cups all-purpose flour');
    expect(result).toEqual({ name: 'all-purpose flour', quantity: 2, unit: 'cups' });
  });

  it('parses fractions', () => {
    const result = parseIngredientString('1/2 cup sugar');
    expect(result).toEqual({ name: 'sugar', quantity: 0.5, unit: 'cups' });
  });

  it('parses mixed numbers', () => {
    const result = parseIngredientString('1 1/2 cups flour');
    expect(result).toEqual({ name: 'flour', quantity: 1.5, unit: 'cups' });
  });

  it('parses teaspoons', () => {
    const result = parseIngredientString('1/4 tsp salt');
    expect(result).toEqual({ name: 'salt', quantity: 0.25, unit: 'tsp' });
  });

  it('parses cloves', () => {
    const result = parseIngredientString('3 cloves garlic, minced');
    expect(result).toEqual({ name: 'garlic', quantity: 3, unit: 'cloves' });
  });

  it('parses pounds', () => {
    const result = parseIngredientString('2 pounds chicken breast');
    expect(result).toEqual({ name: 'chicken breast', quantity: 2, unit: 'lbs' });
  });

  it('handles "of" after unit', () => {
    const result = parseIngredientString('1 cup of milk');
    expect(result).toEqual({ name: 'milk', quantity: 1, unit: 'cups' });
  });

  it('falls back for unknown strings', () => {
    const result = parseIngredientString('salt and pepper to taste');
    expect(result).toEqual({ name: 'salt and pepper to taste', quantity: 1, unit: 'whole' });
  });

  it('handles empty string', () => {
    const result = parseIngredientString('');
    expect(result).toEqual({ name: '', quantity: 1, unit: 'whole' });
  });

  it('handles number without unit', () => {
    const result = parseIngredientString('2 eggs');
    expect(result).toEqual({ name: 'eggs', quantity: 2, unit: 'whole' });
  });

  it('strips trailing notes after comma', () => {
    const result = parseIngredientString('1 cup heavy cream, whipped');
    expect(result).toEqual({ name: 'heavy cream', quantity: 1, unit: 'cups' });
  });
});

// ===== findRecipeInJsonLd =====

describe('findRecipeInJsonLd', () => {
  it('finds top-level Recipe', () => {
    const data = { '@type': 'Recipe', name: 'Test Recipe' };
    const result = findRecipeInJsonLd(data);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Test Recipe');
  });

  it('finds Recipe in @graph array', () => {
    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: 'Page' },
        { '@type': 'Recipe', name: 'Graph Recipe' },
      ],
    };
    const result = findRecipeInJsonLd(data);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Graph Recipe');
  });

  it('finds Recipe in array of objects', () => {
    const data = [
      { '@type': 'Organization', name: 'Org' },
      { '@type': 'Recipe', name: 'Array Recipe' },
    ];
    const result = findRecipeInJsonLd(data);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Array Recipe');
  });

  it('handles @type as array', () => {
    const data = { '@type': ['Recipe', 'HowTo'], name: 'Multi-type Recipe' };
    const result = findRecipeInJsonLd(data);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Multi-type Recipe');
  });

  it('returns null for no Recipe', () => {
    const data = { '@type': 'Article', name: 'Not a recipe' };
    expect(findRecipeInJsonLd(data)).toBeNull();
  });

  it('returns null for null input', () => {
    expect(findRecipeInJsonLd(null)).toBeNull();
  });
});

// ===== extractJsonLdRecipe =====

describe('extractJsonLdRecipe', () => {
  it('extracts recipe from HTML with JSON-LD', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {
          "@type": "Recipe",
          "name": "Test Pasta",
          "description": "A simple pasta dish",
          "recipeYield": "4 servings",
          "recipeIngredient": [
            "2 cups pasta",
            "1 tbsp olive oil",
            "3 cloves garlic, minced"
          ],
          "recipeInstructions": [
            { "@type": "HowToStep", "text": "Boil water and cook pasta." },
            { "@type": "HowToStep", "text": "Heat olive oil in a pan." },
            { "@type": "HowToStep", "text": "Add garlic and saute." }
          ]
        }
        </script>
      </head><body></body></html>
    `;

    const result = extractJsonLdRecipe(html);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Test Pasta');
    expect(result!.description).toBe('A simple pasta dish');
    expect(result!.servings).toBe(4);
    expect(result!.ingredients).toHaveLength(3);
    expect(result!.ingredients[0]).toEqual({ name: 'pasta', quantity: 2, unit: 'cups' });
    expect(result!.rawSteps).toHaveLength(3);
    expect(result!.rawSteps[0]).toBe('Boil water and cook pasta.');
  });

  it('handles @graph nested recipe', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebPage", "name": "Page" },
            {
              "@type": "Recipe",
              "name": "Graph Pasta",
              "recipeIngredient": ["1 cup rice"],
              "recipeInstructions": ["Cook the rice."]
            }
          ]
        }
        </script>
      </head><body></body></html>
    `;

    const result = extractJsonLdRecipe(html);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Graph Pasta');
    expect(result!.ingredients).toHaveLength(1);
    expect(result!.rawSteps).toHaveLength(1);
    expect(result!.rawSteps[0]).toBe('Cook the rice.');
  });

  it('handles plain string instructions', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {
          "@type": "Recipe",
          "name": "Simple",
          "recipeIngredient": ["1 egg"],
          "recipeInstructions": ["Step one.", "Step two."]
        }
        </script>
      </head><body></body></html>
    `;

    const result = extractJsonLdRecipe(html);
    expect(result).not.toBeNull();
    expect(result!.rawSteps).toEqual(['Step one.', 'Step two.']);
  });

  it('returns null for HTML without JSON-LD', () => {
    const html = '<html><head></head><body><h1>No recipe here</h1></body></html>';
    expect(extractJsonLdRecipe(html)).toBeNull();
  });

  it('returns null for JSON-LD without Recipe type', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        { "@type": "Article", "name": "Not a recipe" }
        </script>
      </head><body></body></html>
    `;
    expect(extractJsonLdRecipe(html)).toBeNull();
  });

  it('handles invalid JSON in ld+json block gracefully', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">{ not valid json }</script>
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "Valid", "recipeIngredient": ["1 cup flour"], "recipeInstructions": ["Mix."] }
        </script>
      </head><body></body></html>
    `;
    const result = extractJsonLdRecipe(html);
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Valid');
  });

  it('parses recipeYield as number', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "R", "recipeYield": 6, "recipeIngredient": ["1 egg"], "recipeInstructions": ["Cook."] }
        </script>
      </head><body></body></html>
    `;
    const result = extractJsonLdRecipe(html);
    expect(result!.servings).toBe(6);
  });

  it('parses recipeYield array', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        { "@type": "Recipe", "name": "R", "recipeYield": ["8", "8 servings"], "recipeIngredient": ["1 egg"], "recipeInstructions": ["Cook."] }
        </script>
      </head><body></body></html>
    `;
    const result = extractJsonLdRecipe(html);
    expect(result!.servings).toBe(8);
  });
});
