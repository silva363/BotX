import BotExecution from '../../models/mongodb/BotExecution';
import connectToDatabase from '../../utils/mongodb';

export class MongoBotExecutionRepository {
  async findAll(page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      await connectToDatabase();
      const skip = (page - 1) * pageSize;
      const executions = await BotExecution.find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize);
      
      const total = await BotExecution.countDocuments();
      
      return {
        executions,
        total
      };
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findByUuid(uuid: string): Promise<any> {
    try {
      await connectToDatabase();
      const execution = await BotExecution.findOne({ uuid });
      return execution;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findByBotUuid(botUuid: string): Promise<any[]> {
    try {
      await connectToDatabase();
      const executions = await BotExecution.find({ bot_uuid: botUuid })
        .sort({ created_at: -1 });
      return executions;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async create(executionData: any): Promise<any> {
    try {
      await connectToDatabase();
      const execution = new BotExecution(executionData);
      await execution.save();
      return execution;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async update(uuid: string, executionData: any): Promise<any> {
    try {
      await connectToDatabase();
      const execution = await BotExecution.findOneAndUpdate(
        { uuid },
        { ...executionData, updated_at: new Date() },
        { new: true }
      );
      return execution;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async updateStatus(uuid: string, status: string): Promise<any> {
    try {
      await connectToDatabase();
      const execution = await BotExecution.findOneAndUpdate(
        { uuid },
        { 
          status, 
          updated_at: new Date(),
          ...(status === 'completed' || status === 'failed' ? { end_time: new Date() } : {})
        },
        { new: true }
      );
      return execution;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findRunning(): Promise<any[]> {
    try {
      await connectToDatabase();
      const executions = await BotExecution.find({ status: 'running' });
      return executions;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findRunningByBotUuid(botUuid: string): Promise<any> {
    try {
      await connectToDatabase();
      const execution = await BotExecution.findOne({ 
        bot_uuid: botUuid,
        status: 'running'
      });
      return execution;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }
}
