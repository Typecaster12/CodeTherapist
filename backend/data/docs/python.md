# Python Programming Documentation Reference

## Importing Modules and Circular Dependencies
Circular dependencies happen when two or more modules depend on each other directly or indirectly (e.g. `module_a` imports `module_b` and `module_b` imports `module_a`). This causes module loading failures or `ImportError` exceptions.
To resolve circular dependencies:
1. Re-structure dependencies so that they share a common base module.
2. Move imports inside function scopes (delayed imports) where the import is only resolved when the function runs, avoiding startup loops.

## Mutating Lists and Dicts
In Python, lists and dicts are passed by reference. Mutating a collection inside a function modifies the original object outside that function:
```python
def update_profile(profile):
    profile["updated"] = True  # This mutates the original dictionary!
```
To avoid side-effects, create copies of the collections using `dict(original)` or `original.copy()`, or use deep copy for nested collections:
```python
import copy
new_profile = copy.deepcopy(original)
```

## Exception Handling Best Practices
Always catch specific exceptions instead of using a generic `except:` block, which can swallow syntax errors and interrupt control signals (like KeyboardInterrupt).
Always log full tracebacks when debugging unexpected system errors using `logger.error("Msg", exc_info=True)` or `traceback.print_exc()`.
