import React, { useState } from 'react';
import styled from 'styled-components';
import { gmailService } from '../services/gmailService';

const Container = styled.div`
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
  max-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: #333;
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: #333;
  color: white;
  font-size: 14px;
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  background-color: #4285F4;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3367d6;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const Status = styled.div<{ error?: boolean }>`
  color: ${props => props.error ? '#ff4444' : '#4CAF50'};
  font-size: 14px;
  margin-top: 10px;
`;

const EmailComposer: React.FC = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatus(null);

    try {
      await gmailService.sendEmail(to, subject, body);
      setStatus({ message: 'Email sent successfully!' });
      setTo('');
      setSubject('');
      setBody('');
    } catch (error) {
      setStatus({ 
        message: error instanceof Error ? error.message : 'Failed to send email', 
        error: true 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <TextArea
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <Button type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Email'}
        </Button>
        {status && (
          <Status error={status.error}>
            {status.message}
          </Status>
        )}
      </Form>
    </Container>
  );
};

export default EmailComposer; 