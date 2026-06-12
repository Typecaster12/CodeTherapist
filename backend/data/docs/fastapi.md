# FastAPI Documentation Reference

## Asynchronous Endpoints: async def vs def
In FastAPI, you can define routes using `async def` or `def`. 
- Use `async def` if you are using library calls that support asynchronous operations (using `await`).
- If you use `async def` but make blocking synchronous calls inside (like `time.sleep()` or synchronous database queries via pymongo), it will block the event loop and reduce performance.
- Use plain `def` for synchronous tasks. FastAPI runs synchronous routes in an external thread pool automatically.

## Dependency Injection (Depends)
The `Depends` mechanism allows declaring shared dependencies (like databases, security guards, authentication, or query parameters). Dependencies can yield a value and perform cleanup using `yield` instead of `return`.
Example protecting a route:
```python
@router.post("/items")
def create_item(payload: Item, current_user: User = Depends(get_current_user)):
    return {"message": "Success"}
```

## Pydantic Validation Errors
FastAPI automatically parses incoming JSON payloads into Pydantic models. If the client sends an invalid request payload (e.g. missing required fields, wrong data types, or invalid constraints), FastAPI intercepts the request and returns a `422 Unprocessable Entity` status code containing structured details of the validation errors.
Always specify constraints using `Field(...)` or custom validator annotations.
