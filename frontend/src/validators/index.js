export const rules = {
  required: (value) => !!value || value === 0,
  email: (value) => /^\S+@\S+\.\S+$/.test(value),
  minLength: (min) => (value) => value && value.length >= min,
  maxLength: (max) => (value) => !value || value.length <= max,
  min: (minVal) => (value) => parseFloat(value) >= minVal,
  max: (maxVal) => (value) => parseFloat(value) <= maxVal,
  pattern: (regex) => (value) => regex.test(value),
};

export const userValidators = {
  name: (value) => {
    if (!value) return "Meno je povinné";
    if (value.length < 2) return "Meno musí mať aspoň 2 znaky";
    return "";
  },

  email: (value) => {
    if (!value) return "Email je povinný";
    if (!rules.email(value)) return "Neplatný email";
    return "";
  },

  password: (value) => {
    if (!value) return "Heslo je povinné";
    if (value.length < 6) return "Heslo musí mať aspoň 6 znakov";
    return "";
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return "Potvrdenie hesla je povinné";
    if (password !== confirmPassword) return "Heslá sa nezhodujú";
    return "";
  },
};

export const bookValidators = {
  title: (value) => {
    if (!value) return "Názov je povinný";
    return "";
  },

  author: (value) => {
    if (!value) return "Autor je povinný";
    return "";
  },

  isbn: (value) => {
    if (!value) return "ISBN je povinné";
    if (!/^(?:\d{10}|\d{13})$/.test(value)) return "ISBN musí mať 10 alebo 13 číslic";
    return "";
  },

  year: (value) => {
    const year = parseInt(value);
    const currentYear = new Date().getFullYear();
    if (!value) return "Rok je povinný";
    if (year < 1000) return "Rok je príliš starý";
    if (year > currentYear + 5) return "Rok nesmie byť z ďalekej budúcnosti";
    return "";
  },

  description: (value) => {
    if (value && value.length > 2000) return "Popis môže mať max 2000 znakov";
    return "";
  },

  totalCopies: (value) => {
    const copies = parseInt(value);
    if (!value) return "Počet kusov je povinný";
    if (copies < 1) return "Musí byť aspoň 1 kus";
    return "";
  },

  coverImage: (file) => {
    if (file && file.size > 5 * 1024 * 1024) return "Obrázok môže mať max 5MB";
    return "";
  },
};

export const reviewValidators = {
  rating: (value) => {
    if (!value || value === 0) return "Zvoľte hodnotenie";
    if (value < 1 || value > 5) return "Hodnotenie musí byť 1-5";
    return "";
  },

  comment: (value) => {
    if (value && value.length > 500) return "Komentár môže mať max 500 znakov";
    return "";
  },
};

export const loanValidators = {
  dueDate: (value, minDate) => {
    if (!value) return "Dátum vrátenia je povinný";
    if (new Date(value) < new Date(minDate)) return "Dátum vrátenia nemôže byť v minulosti";
    return "";
  },

  notes: (value) => {
    if (value && value.length > 500) return "Poznámky môžu mať max 500 znakov";
    return "";
  },

  extendDays: (value) => {
    if (!value) return "Počet dní je povinný";
    if (value < 1) return "Minimálne 1 deň";
    if (value > 365) return "Maximálne 365 dní";
    return "";
  },
};

export const validateForm = (validators, data) => {
  const errors = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(validators)) {
    const error = validator(data[field]);
    errors[field] = error;
    if (error) isValid = false;
  }

  return { errors, isValid };
};

export const hasErrors = (errors) => {
  return Object.values(errors).some((error) => error);
};
