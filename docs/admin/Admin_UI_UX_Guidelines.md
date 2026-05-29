# Admin UI/UX Guidelines

## Core Principles
1. **Compact & Professional**: Avoid oversized padding. Use `sm:p-5` instead of `p-8` for cards to maximize data density.
2. **Consistent Visual Hierarchy**: 
   - `H1`: Page Titles (e.g., `text-3xl font-extrabold`)
   - `H3`: Card Headers (`text-lg font-bold`)
   - `Labels`: Uppercase tracking text (`text-[11px] font-bold uppercase tracking-wider text-slate-500`)
3. **Color Tokens**:
   - `Indigo-600`: Primary actions
   - `Rose-600`: Destructive actions (Deletes, Rejections)
   - `Emerald-600`: Success states (Approvals, Active status)
   - `Slate-50/100/200`: Backgrounds and borders
4. **Data Presentation**: Use tables (`AdminTable`) for list views to ensure columns align perfectly. Use cards (`AdminCard`) for detail views or editing forms.
