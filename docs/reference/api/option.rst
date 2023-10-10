Option
======

An ``Option`` is either ``Some`` (contains a `value`_ of type ``T`` inside) or ``None`` (no value).

.. code-block:: typescript

    Option<T> = Some<T> | None

Necessary imports:

.. code-block:: typescript

    import { None, Option, Some } from 'ts-results-es'

Construction:

.. code-block:: typescript

    const some = Some('some value')
    // None is a singleton, no construction necessary

``andThen()``
-------------

.. code-block:: typescript

    andThen<T2>(mapper: (val: T) => Option<T2>): Option<T2>

Calls ``mapper`` if the ``Option`` is ``Some``, otherwise returns ``None``.
This function can be used for control flow based on ``Option`` values.

``value``
---------

The value contained in ``Some``. Only present on ``Some`` objects.

``expect()``
------------

.. code-block:: typescript

    expect(msg: string): T

Returns the contained ``Some`` value, if exists.  Throws an error if not.

If you know you're dealing with ``Some`` and the compiler knows it too (because you tested
`isSome()`_ or `isNone()`_) you should use `value`_ instead. While ``Some``'s `expect()`_ and `value`_ will
both return the same value using `value`_ is preferable because it makes it clear that
there won't be an exception thrown on access.

``msg``: the message to throw if no ``Some`` value.

``isNone()``
------------

.. code-block:: typescript

    isNone(): this is None

``true`` when the ``Option`` is ``None``.

``isSome()``
------------

.. code-block:: typescript

    isSome(): this is Some<T>

``true`` when the ``Option`` is ``Some``.

``map()``
---------

.. code-block:: typescript

    map<U>(mapper: (val: T) => U): Option<U>

Maps an ``Option<T>`` to ``Option<U>`` by applying a function to a contained ``Some`` value,
leaving a ``None`` value untouched.

This function can be used to compose the Options of two functions.

``mapOr()``
-----------

.. code-block:: typescript

    mapOr<U>(default_: U, mapper: (val: T) => U): U

Maps an ``Option<T>`` to ``Option<U>`` by either converting ``T`` to ``U`` using ``mapper`` (in case
of ``Some``) or using the ``default_`` value (in case of ``None``).

If ``default_`` is a result of a function call consider using `mapOrElse()`_ instead, it will
only evaluate the function when needed.

``mapOrElse()``
---------------

.. code-block:: typescript

    mapOrElse<U>(default_: () => U, mapper: (val: T) => U): U

Maps an ``Option<T>`` to ``Option<U>`` by either converting ``T`` to ``U`` using ``mapper`` (in case
of ``Some``) or producing a default value using the ``default_`` function (in case of ``None``).

``or()``
--------

.. code-block:: typescript

    or(other: Option<T>): Option<T>

Returns ``Some()`` if we have a value, otherwise returns ``other``.

``other`` is evaluated eagerly. If ``other`` is a result of a function
call try `orElse()`_ instead – it evaluates the parameter lazily.

Example:

.. code-block:: typescript

    Some(1).or(Some(2)) // => Some(1)
    None.or(Some(2)) // => Some(2)

``orElse()``
------------

.. code-block:: typescript

    orElse(other: () => Option<T>): Option<T>

Returns ``Some()`` if we have a value, otherwise returns the result
of calling ``other()``.

``other()`` is called *only* when needed.

Example:

.. code-block:: typescript

    Some(1).orElse(() => Some(2)) // => Some(1)
    None.orElse(() => Some(2)) // => Some(2) 

``toResult()``
--------------

.. code-block:: typescript

    toResult<E>(error: E): Result<T, E>

Maps an ``Option<T>`` to a ``Result<T, E>``.

``unwrap()``
------------

.. code-block:: typescript

    unwrap(): T

Returns the contained ``Some`` value.
Because this function may throw, its use is generally discouraged.
Instead, prefer to handle the ``None`` case explicitly.

If you know you're dealing with ``Some`` and the compiler knows it too (because you tested
`isSome()`_ or `isNone()`_) you should use `value`_ instead. While ``Some``'s `unwrap()`_ and `value`_ will
both return the same value using `value`_ is preferable because it makes it clear that
there won't be an exception thrown on access.

Throws if the value is ``None``.

``unwrapOr()``
--------------

.. code-block:: typescript

    unwrapOr<T2>(val: T2): T | T2

Returns the contained ``Some`` value or a provided default.


.. _cause: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
