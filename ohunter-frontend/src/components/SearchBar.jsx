export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search jobs" }) {
  return (
    <form onSubmit={onSubmit} className="search-row">
      <input
        className="search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button className="btn-primary" type="submit">Search</button>
    </form>
  );
}
