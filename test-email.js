const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  console.log('Testing Resend with API key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Pittima App <info@zannalabs.com>',
      to: ['domyzmail@gmail.com'],
      subject: 'Test da Pittima App',
      html: '<p>Se ricevi questa email, Resend funziona! ��</p>',
    });
    
    if (error) {
      console.error('Errore:', error);
    } else {
      console.log('Email inviata! ID:', data?.id);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

test();
