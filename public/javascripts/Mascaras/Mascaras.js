//mascara Cnpj
const cnpjInput = document.getElementById('cnpj');
if(cnpjInput){
    VMasker(cnpjInput).maskPattern('99.999.999/9999-99');
}


// mascara telefone
const telefoneInput = document.getElementById('telefone');
if(telefoneInput){
    telefoneInput.addEventListener('input', () => {
        const value = telefoneInput.value.replace(/\D/g, '');
        const mask = value.length > 10 ? '(99) 99999-9999' : '(99) 9999-9999';
        VMasker(telefoneInput).unMask();
        VMasker(telefoneInput).maskPattern(mask);
    });
}
