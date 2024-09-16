function showData(event){
    event.preventDefault();
    let name = document.getElementById('nameEnter').value;
    document.getElementById('customername').innerText = name;
   
    let payment = document.getElementById('Payment-option').value;
    document.getElementById('payment-mode').innerHTML = payment;
}

// For generating random invoice number 
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

let a = getRndInteger(1000000, 9999999);
document.getElementById('invoice-number').innerHTML = '#' + a;

// For current date 
const today = new Date();
const shortDate = today.toLocaleDateString();
document.getElementById('date').innerHTML = shortDate;

// Convert product name to uppercase
function upper() {
    let product_name = document.getElementById('product_name');
    product_name.value = product_name.value.toUpperCase();
}

// For item price calculation
function pricecal() {
    let product_rate = parseFloat(document.getElementById('rate').value);
    let quantity = parseFloat(document.getElementById('Quantity').value);
    let product_price = product_rate * quantity;
    document.getElementById('calcu').value = product_price;
    document.getElementById('Balance').innerHTML = '₹ ' + product_price.toFixed(2);
}

document.getElementById('add_item').addEventListener('click', addItem);

function addItem(event) {
    // Prevent the form from submitting or refreshing the page
    event.preventDefault();

    // Get input values and trim any extra spaces
    const productName = document.getElementById('product_name').value.trim();
    const quantity = document.getElementById('Quantity').value.trim();
    const rate = document.getElementById('rate').value.trim();

    // Validate input to avoid adding empty rows
    if (!productName || !quantity || !rate || isNaN(quantity) || isNaN(rate)) {
        // alert("Please fill in all the fields with valid data");
        return; // Stop the function if validation fails
    }

    // Calculate amount
    const amount = quantity * rate;

    // Create a new table row
    const tableBody = document.getElementById('table_body');
    const newRow = document.createElement('tr');

    // Create a cell for "Item" and set its colspan to 3
    const itemNameCell = document.createElement('td');
    itemNameCell.colSpan = 3;  // Match colspan with the header
    itemNameCell.style.width = '200px';  // Apply width
    itemNameCell.textContent = productName;

    // Create individual cells for Quantity, Rate, and Amount
    const quantityCell = document.createElement('td');
    quantityCell.textContent = quantity;

    const rateCell = document.createElement('td');
    rateCell.textContent = rate;

    const amountCell = document.createElement('td');
    amountCell.textContent = amount;

    // Append cells to the new row
    newRow.appendChild(itemNameCell);
    newRow.appendChild(quantityCell);
    newRow.appendChild(rateCell);
    newRow.appendChild(amountCell);

    // Append the new row to the table body (only after validation is successful)
    tableBody.appendChild(newRow);

    // Optionally, store the new item in localStorage
    storeInLocalStorage(productName, quantity, rate, amount);

    // Clear input fields after successful addition
    document.getElementById('product_name').value = '';
    document.getElementById('Quantity').value = '';
    document.getElementById('rate').value = '';

    // Clear the calculated amount as well
    document.getElementById('calcu').value = '';
    document.getElementById('Balance').innerHTML = '';
}

// Function to store data in localStorage (optional)
function storeInLocalStorage(productName, quantity, rate, amount) {
    const product = {
        productName,
        quantity,
        rate,
        amount
    };

    // Retrieve existing data or initialize an empty array
    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];

    // Add the new product
    storedProducts.push(product);

    // Store updated data back in localStorage
    localStorage.setItem('products', JSON.stringify(storedProducts));
}


// Function to calculate subtotal, apply discount, and display results
function updateInvoice() {
    // Initialize subtotal
    let subtotal = 0;

    // Get all rows in the table body
    const tableBody = document.getElementById('table_body');
    const rows = tableBody.getElementsByTagName('tr');

    // Iterate through each row to calculate the subtotal
    for (const row of rows) {
        // Assuming the amount is in the last cell of the row
        const amountCell = row.getElementsByTagName('td')[3];
        if (amountCell) {
            const amount = parseFloat(amountCell.textContent.trim().replace('₹ ', ''));
            if (!isNaN(amount)) {
                subtotal += amount;
            }
        }
    }

    // Get the payment method (assuming it's stored in an input or select)
    const paymentMethod = document.getElementById('Payment-option').value;

    // Calculate discount if payment method is "Card"
    let discount = 0;
    if (paymentMethod === 'Card') {
        discount = subtotal * 0.02; // 2% discount
    }

    // Calculate total after discount
    const totalAfterDiscount = subtotal - discount;

    // Update the HTML elements
    document.getElementById('s_total').innerText = subtotal.toFixed(2);
    document.getElementById('discount').innerText = discount.toFixed(2);
    document.getElementById('Balance').innerText = totalAfterDiscount.toFixed(2);
}

// Example: Call the function when the "Add Item" button is clicked
document.getElementById('add_item').addEventListener('click', function() {
    addItem(); // Assuming you have an existing addItem function
    updateInvoice(); // Update the invoice details
});

// Example: Call the function when the payment method changes
document.getElementById('Payment-option').addEventListener('change', updateInvoice);

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title and shop name
    doc.setFontSize(26);
    doc.text("INVOICE", 150, 20);

    doc.setFontSize(10)
    doc.text(`${document.getElementById('invoice-number').innerText}`, 170, 25);

    doc.setFontSize(16);
    doc.text("S QUBE A COFFEE SHOP", 20, 50);

    // Add customer details
    doc.setFontSize(12);
    doc.text(`Date:   ${document.getElementById('date').innerText}`, 151, 40);
    doc.text(`Payment mode :   ${document.getElementById('Payment-option').value}`,140,50)
    doc.text(`Bill To:  ${document.getElementById('customername').innerText}`, 20, 60);
   

    // Table Headers and Rows
    const tableColumns = ["Item", "Quantity", "Rate", "Amount"];
    const tableRows = [];

    // Add table rows
    const tableBody = document.getElementById('table_body');
    const rows = tableBody.getElementsByTagName('tr');
    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        tableRows.push([
            cells[0].textContent.trim(),
            cells[1].textContent.trim(),
            cells[2].textContent.trim(),
            cells[3].textContent.trim()
        ]);
    }

    // Add table to PDF
    doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 70,
        margin: { horizontal: 20 },
        styles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 40 }
        }
    });

    // Get final Y position after table
    const finalY = doc.autoTable.previous.finalY;

    // Add subtotal, discount, and total
    const yStart = finalY + 10; // Start Y position for subtotal
    const columnWidths = { 0: 120, 1: 30 }; // Define column widths for alignment
    const textValues = [
        { label: 'Subtotal:', value:'Rs '+document.getElementById('s_total').innerHTML },
        { label: 'Discount:', value:'Rs '+document.getElementById('discount').innerHTML },
        { label: 'Total:', value:'Rs '+document.getElementById('Balance').innerHTML }
    ];
    
    // Function to apply a specific font style to these text values
    textValues.forEach(item => {
        // Assuming these values are displayed somewhere on the page
        let displayElement = document.createElement('div'); // Create a new div to show each value
        
        displayElement.innerHTML = `<span style="font-family: 'Arial', sans-serif; font-size: 16px;">${item.label} ${item.value}</span>`;
        
        // Append the display element to the desired container in your HTML
        document.body.appendChild(displayElement); // Change document.body to any other container where you want to display these values
    });
    

    textValues.forEach((item, index) => {
        doc.setFontSize(12);
        const yPosition = yStart + (index * 10); // Position each text line
        doc.text(item.label, 155, yPosition, {align: 'right' }); // Label on the left
        doc.text(item.value, 180, yPosition, { align: 'right' }); // Value aligned to the right
    });

    // Save the PDF
    doc.save('invoice.pdf');
}

// Attach the PDF generation function to the download button
document.getElementById('download').addEventListener('click', generatePDF);


function lightmode(){
    let navbar = document.getElementById('navbar');
    let icon = document.getElementById('light-icon');
  
    if(icon.classList.contains('fa-sun')){
        navbar.style.backgroundColor = '#1e2022';
        navbar.style.color = 'white';

        let link = document.querySelectorAll('#navbar a');

        link.forEach(links =>{
            links.style.color='white'
        })

        document.getElementById('overallmain').style.backgroundColor = '#363a3d'
        document.getElementById('main-right').style.color = 'white'
    

        icon.classList.replace('fa-sun', 'fa-moon')
}else{
        navbar.style.backgroundColor = '#ffffff';
        navbar.style.color = '#000000';
        
        // Change link colors back to dark
        let links = document.querySelectorAll('#navbar a');
        links.forEach(link => {
            link.style.color = '#000000';
        });
        document.getElementById('overallmain').style.backgroundColor = 'rgb(239, 239, 239)'
        document.getElementById('main-right').style.color = 'black'
        // Switch icon to sun
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
}
}
