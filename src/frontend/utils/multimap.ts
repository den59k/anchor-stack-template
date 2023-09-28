class MultiMap<T, K> {
  _map = new Map<T, K[]>()

  get size() {
    return this._map.size
  }

  add(key: T, value: K) {
    const arr = this._map.get(key)
    if (!arr) {
      this._map.set(key, [ value ])
    } else {
      arr.push(value)
    }
  }

  remove(key: T, value: K) {
    const arr = this._map.get(key)
    if (!arr) return false
    const newArr = arr.filter(item => item !== value)
    if (newArr.length === arr.length) return false
    if (newArr.length === 0) {
      this._map.delete(key)
    } else {
      this._map.set(key, newArr)
    }
    return true
  }

  has(key: T) {
    return this._map.has(key)
  }

  get(key: T) {
    return this._map.get(key) || []
  }

  forEach(key: T, callback: (val: K) => void) {
    const arr = this._map.get(key)
    if (!arr) return
    arr.forEach(callback)
  }
}

export default MultiMap