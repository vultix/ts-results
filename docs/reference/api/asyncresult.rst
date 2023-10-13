AsyncResult
===========

An async-aware :doc:`result` counterpart.

Can be combined with asynchronous code without having to ``await`` anything right until
the moment when you're ready to extract the final ``Result`` out of it.

Can also be combined with synchronous code for convenience.

.. code-block:: typescript

    // T is the Ok value type, E is the Err error type
    AsyncResult<T, E>

Imports:

.. code-block:: typescript

    import { AsyncResult } from 'ts-results-es'

Construction:

You can construct it directly from ``Result<T, E>`` or ``Promise<Result<T, E>>``:

.. code-block:: typescript

    const result1 = new AsyncResult(Ok(1))
    const result2 = new AsyncResult((async () => Err('bad_error')())

Or you can use the :ref:`Result.toAsyncResult() <toAsyncResult>` method:

.. code-block:: typescript

    const result3 = Ok(1).toAsyncResult()

Only the most important methods are currently implemented. The following methods can be
added with not too much effort:

* ``mapErr()``
* ``mapOr()``
* ``mapOrElse()``
* ``or()``
* ``orElse()``

``andThen()``
-------------

.. code-block:: typescript

    andThen<T2, E2>(
        mapper: (val: T) => Result<T2, E2> | Promise<Result<T2, E2>> | AsyncResult<T2, E2>
    ): AsyncResult<T2, E | E2>

Calls ``mapper`` if the result is ``Ok``, otherwise keeps the ``Err`` value intact.
This function can be used for control flow based on ``Result`` values.

Example:

.. code-block:: typescript

    let goodResult = Ok(1).toAsyncResult()
    let badResult = Err('boo').toAsyncResult()

    await goodResult.andThen(async (value) => Ok(value * 2)).promise // Ok(2)
    await goodResult.andThen(async (value) => Err(`${value} is bad`)).promise // Err('1 is bad')
    await badResult.andThen(async (value) => Ok(value * 2)).promise // Err('boo')

``map()``
---------

.. code-block:: typescript

    map<U>(mapper: (val: T) => U | Promise<U>): AsyncResult<U, E>

Maps an ``AsyncResult<T, E>`` to ``AsyncResult<U, E>`` by applying a function to a contained
``Ok`` value, leaving an ``Err`` value untouched.

This function can be used to compose the results of two functions.

Example:

.. code-block:: typescript

    let goodResult = Ok(1).toAsyncResult()
    let badResult = Err('boo').toAsyncResult()

    await goodResult.map(async (value) => value * 2).promise // Ok(2)
    await badResult.andThen(async (value) => value * 2).promise // Err('boo')

``promise``
-----------

.. code-block:: typescript

    promise: Promise<Result<T, E>>

A promise that resolves to a synchronous result.

Await it to convert ``AsyncResult<T, E>`` to ``Result<T, E>``.
